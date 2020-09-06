const core = require('@actions/core');
const exec = require('@actions/exec');
const path = require('path');

try {
  const time = (new Date()).toTimeString();
  const files = JSON.parse(core.getInput('files'));

  const src = core.getInput('src');
  const dest = core.getInput('dest');
  const ftpUsername = core.getInput('ftpUsername');
  const ftpPassword = core.getInput('ftpPassword');
  const ftpHostname = core.getInput('ftpHostname');

  files.forEach(file => {
    if (!file.filename.startsWith(src))
      return;
    const remoteFilePath = file.filename.substr(src.length);
    const remoteDirPath = path.dirname(remoteFilePath);
    const serverPath = `${ftpHostname}/${dest}/${remoteDirPath}`.replace(/\/\//g, '/');
    const fullFtpPath = `ftp://${serverPath}`;
    console.log(`${file.filename} -> ${fullFtpPath}`);
    await exec.exec('curl', ['-T', file.filename, '--user', `${ftpUsername}:${ftpPassword}`,fullFtpPath])
  });
} catch (error) {
  core.setFailed(error.message);
}
