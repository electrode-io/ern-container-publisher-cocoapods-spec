import { ContainerPublisher } from 'ern-container-publisher'
import { createTmpDir, gitCli, shell, log, NativePlatform, mustacheUtils } from 'ern-core'
import path from 'path'
import fs from 'fs'

export default class CocoaPodsSpecPublisher implements ContainerPublisher {
  get name(): string {
    return 'cocoapods-spec'
  }

  get platforms(): NativePlatform[] {
    return ['ios']
  }

  public async publish({
    containerPath,
    containerVersion,
    url,
    platform,
    extra,
  }: {
    containerPath: string
    containerVersion: string
    url?: string,
    platform: string,
    extra?: {
      branch?: string,
      subdir?: string,
      allowVersionOverwrite?: boolean,
      sourceRepoUrl: string
    }
  }) {
    const workingGitDir = createTmpDir()
    const branch = (extra && extra.branch) || 'master'
    const allowVersionOverwrite = (extra && extra.allowVersionOverwrite) || false

    if (!url) {
      throw new Error('url is required')
    }

    if (!extra?.sourceRepoUrl) {
      throw new Error('extra.sourceRepoUrl is required')
    }

    try {
      shell.pushd(workingGitDir)
      const git = gitCli()

      const re = new RegExp(`refs/heads/${branch}`)
      const remoteHeads = await gitCli().raw(['ls-remote', '--heads', url])

      log.debug(`workingGitDir: ${workingGitDir}`)

      if (re.test(remoteHeads)) {
        log.debug(`${branch} branch exists in remote. Reusing it.`)
        log.debug(`Running 'git clone ${url} . --single-branch --branch ${branch} --depth 1`)
        await gitCli().clone(url, '.', ['--single-branch', '--branch', branch, '--depth', '1'])
      } else {
        log.debug(`${branch} branch does not exists in remote. Creating it.`)
        log.debug(`Running 'git clone ${url} . --depth 1`)
        await gitCli().clone(url, '.', ['--depth', '1'])
        await git.checkoutLocalBranch(branch)
      }

      const versionDir = path.join(workingGitDir, 'ElectrodeContainer', containerVersion)
      if (fs.existsSync(versionDir) && !allowVersionOverwrite) {
        throw new Error(`Container version already exists`)
      }

      shell.mkdir('-p', versionDir);
      await mustacheUtils.mustacheRenderToOutputFileUsingTemplateFile(
        path.join(__dirname, 'ElectrodeContainer.podspec.mustache'),
        {containerVersion, url: extra.sourceRepoUrl},
        path.join(versionDir, 'ElectrodeContainer.podspec')
      )

      await git.add('./*')
      await git.commit(`Container v${containerVersion}`)
      const tagsOptions = allowVersionOverwrite ? ['-f'] : []
      await git.tag([`v${containerVersion}`, ...tagsOptions])
      await git.push('origin', branch)
      await git.raw(['push', 'origin', '--tags', ...tagsOptions])
      log.info('[=== Completed publication of the Container ===]')
      log.info(`[Publication url : ${url}]`)
      log.info(`[Git Branch: ${branch}]`)
      log.info(`[Git Tag: v${containerVersion}]`)
    } finally {
      shell.popd()
    }
  }
}
