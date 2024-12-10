const core = require('@actions/core');
const exec = require('@actions/exec');
const path = require('path');

async function main() {
  try {
    const dryRun = core.getInput('dryRun', { required: false });
    if (dryRun === 'true')
      console.log('Running in dryRun mode');
    const files = JSON.parse(core.getInput('files'));

    const src = core.getInput('src');
    const dest = core.getInput('dest');
    const ftpUsername = core.getInput('ftpUsername');
    const ftpPassword = core.getInput('ftpPassword');
    const ftpHostname = core.getInput('ftpHostname');
    const ignoreFiles = JSON.parse(core.getInput('ignore'));

    for (let file of files) {
      const filename = file.filename;
      if (!filename.startsWith(src))
        continue;
      for (let ignoreFile of ignoreFiles)
        if (filename.endsWith(ignoreFile))
          continue
      const remoteFilePath = filename.substr(src.length);
      const remoteDirPath = path.dirname(remoteFilePath);
      const serverPath = `${ftpHostname}/${dest}/${remoteDirPath}/`.replace(/\/{2,}/g, '/');
      const fullFtpPath = `ftp://${serverPath}`;
      let curlFlags;
      switch (file.status) {
        case 'removed':
          const fileToRemove = path.basename(filename);
          curlFlags = ['--silent', '--quote', `-DELE ${fileToRemove}`, '--user', `${ftpUsername}:${ftpPassword}`, fullFtpPath]
          break;
        default:
          curlFlags = ['--ftp-create-dirs', '--silent', '--upload-file', filename, '--user', `${ftpUsername}:${ftpPassword}`, fullFtpPath]
          break;
      }
      console.log(curlFlags.join(' '));
      if (dryRun !== 'true')
        await exec.exec('curl', curlFlags)
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
