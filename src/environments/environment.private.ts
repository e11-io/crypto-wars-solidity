// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=private` then `environment.private.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  blockTime: 1 * 3, // We multiply block time by 3 to avoid excessive calls to the node.
  production: false,
  remoteContracts: false,

  /* LATEST MIGRATION TO e11 311 */
  contracts: {
    Migrations:         null,
    ExperimentalToken:  null,
    UserVault:          null,
    UserResources:      null,
    BuildingsData:      null,
    UserBuildings:      null,
    UserVillage:        null,
    BuildingsQueue:     null,
  },
};
