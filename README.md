# Electrode Native CocoaPod Spec Container Publisher

[![ci][1]][2]

This publisher can be used to publish the [CocoaPod](3) spec of an iOS container to a remote Git pod spec repository. The Git repository provider should not matter (GitHub, BitBucket, TFS ...).

**This publisher expect that the container is distributed as a precompiled XCFramework**

In future updates of this publisher we may support other distribution formats based on new needs.

The target Git remote repository must exist. It will not be created by this publisher.

## Usage

### With `ern publish-container` CLI command

#### Required

- `--url/-u` : URL of the remote Git repository (SSH or HTTPS) to publish to
- `--publisher/-p` : `cocoapod-spec`
- `--platform` : `ios`
- `sourceRepoUrl` should be set in the `extra` object payload (via `-e` option). It should point to the Git repository url where the container xcframework is stored.

#### Optional

- `--containerPath` : Path to the Container to publish.\
Defaults to the Electrode Native default iOS Container Generation path (`~/.ern/containergen/out/ios` if not changed through config)

- `--containerVersion/-v` : Version of the Container to publish.\
Default to `1.0.0`

- `branch` : The name of the branch to publish to.\
Default to `main`

The `ern publish-container` CLI command can be used as follow to manually publish a Container using the cocoapod git publisher :

```sh
ern publish-container --containerPath [pathToContainer] -p cocoapod-spec -u [gitRepoUrl] -v [containerVersion] ---platform [android|ios] -e '{"branch":"[branch_name]"}'
```

- `allowVersionOverwrite` : A boolean flag to allow overwriting the version (tag). Defaults to false.

```sh
ern publish-container --containerPath [pathToContainer] -p cocoapod-spec -u [gitRepoUrl] -v [containerVersion] ---platform [android|ios] -e '{"allowVersionOverwrite": true}'
```

### With Cauldron

#### Required

- `--publisher/-p` : `cocoapod-spec`
- `--url/-u` : URL of the remote Git repository (SSH or HTTPS) to publish to
- `sourceRepoUrl` should be set in the `extra` object payload. It should point to the Git repository url where the container xcframework is stored.

#### Optional

- `branch` : The name of the branch to publish to.\
Please note that the branch needs to be created manually before hand in the remote repo. Defaults to `main`

- `allowVersionOverwrite` : A boolean flag to allow overwriting the version (tag).\
Defaults to false.

To automatically publish Cauldron generated Containers of a target native application and platform, the `ern cauldron add publisher` command can be used as follow:

```sh
ern cauldron add publisher -p cocoapod-spec -u [gitRepoUrl] -e '{"branch":"[branch_name]"}'
```

This will result in the following publisher entry in Cauldron :

```json
{
  "name": "cocoapod-spec",
  "url": "[gitRepoUrl]",
  "extra": {
    "branch": "[branch_name]",
    "allowVersionOverwrite": "[allowVersionOverwrite]",
    "sourcRepoUrl": "[sourceRepoUrl]"
  }
}
```

This is only needed once. Once the configuration for the publisher is stored in Cauldron, any new Cauldron generated Container will be published to Git.

### Programmatically

```js
import GitPublisher from 'ern-container-publisher-cocoapod-spec'
const publisher = new CocoaPodGitPublisher()
publisher.publish({
  /* Local file system path to the Container */
  containerPath,
  /* Version of the Container. Will result in a Git tag. */
  containerVersion,
  /* Remote Git repository url (ssh or https) */
  url,
  /* Extra config specific to this publisher */
  extra?: {
    /* Name of the branch to publish to */
    branch?: string
    /* Allow version (tag) overwrite */
    allowVersionOverwrite?: boolean
    /* Source repository url [REQUIRED] */
    sourceRepoUrl: string
  }
})
```

[1]: https://github.com/electrode-io/ern-container-publisher-cocoapod-spec/workflows/ci/badge.svg
[2]: https://github.com/electrode-io/ern-container-publisher-cocoapod-spec/actions
[3]: https://cocoapods.org
[4]: https://github.com/electrode-io/ern-container-transformer-xcframework
