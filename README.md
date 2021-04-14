FTP server uploader action.

Input:

|Params name|Type|Required|Default|Example|
|--|--|--|--|--|
|files|[String]|Yes|
|ftpUsername|String|No|anonymous|
|ftpPassword|String|No|
|src|String|No|/|/dist|
|dest|String|No|/
|ignore|String|No|'[]'|'["node_modules"]'

Sample config


```yaml
on:
  pull_request:
    types: [closed]

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy to ftp server
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Check pull request
        uses: actions/github-script@v3
        id: set-result
        with:
          script: |
            return github.pulls.listFiles({owner: context.payload.repository.owner.login, repo: context.payload.repository.name, pull_number: context.payload.number})
              .then(resp => 
                resp.data.map(
                  file => ({filename: file.filename, status: file.status})
                )
              )
      - name: Upload files to ftp server
        uses: ./ 
        id: upload-to-ftp
        with:
          files: ${{steps.set-result.outputs.result}}
          ftpUsername: testUser
          ftpPassword: testPassword
          ftpHostname: ftp.test
          src: test_folder
          dest: '/test_dir'
```
