# Keymaster
Keymaster is a Slack bot who hands out temporary AWS credentials, all through a convenient Slash command. Key requests are tracked through a channel so you can stay up to date on who is requesting credentials.

## Setup
### AWS Credentials
You will need AWS access keys to run **Keymaster** with which have **STS** permissions. The minimum required permissions are below:
```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "sts:AssumeRole"
            ],
            "Resource": [
                "*"
            ]
        }
    ]
}
```

You may restrict the **Resource** ARNs if you would like. The access keys from the resulting user with the above policy will be used as environment variables below.

### Assumable Roles
**Keymaster** uses a `roles.json` file to track assumable roles. Populate this file with all role names you would like to be assumable and match them with the associated ARN. The format of this file is shown below:
```
{
  "admin": "arn:aws:iam::1234567890:role/admin",
  "s3": "arn:aws:iam::1234567890:role/s3-read-only"
}
```

**NOTE:** These roles must be cross-domain roles to be assumable within the same AWS account. During role creation select "Role for Cross-Account Access" and choose the first option. You will most likely need to create new roles specific for **Keymaster**.

### Setting Up the Slash Command
Start by setting up a [Slack Slash command](https://slack.com/apps/A0F82E8CA-slash-commands) for your Slack account. You may name the command whatever you want, though I recommend **keymaster**. Set the URL to be https://[some-url]/api/slash where **[some-url]** is a domain or subdomain you will set up for this project. Slack requires HTTPS, so you must have a certificate (even if it's self-signed). The site must also be accessible from Slack, so publicly accessible is best. Set the command name to **Keymaster**, description to the text at the top of this readme, and usage hint to **help**.

The **token** field value will need to be injected into the **Keymaster** environment as a variable, so copy this somewhere.

### Setting Up the Audit Webhook (Optional)
**Keymaster** can optionally chat public audit logs for who has generated credentials. To enable this create a [Slack Incoming Webhook](https://slack.com/apps/A0F7XDUAZ-incoming-webhooks). The webhook URL will be needed as an environment variable. The audit channel and bot name can be overridden by environment variables, the rest of the webhook configs will be pulled from the webhook setup.

### Running Keymaster
**Keymaster** is most easily run as a Docker container. You can install Docker following [their instructions](https://docs.docker.com/engine/installation/), though I find the easier way to install it is by running the following:
```bash
curl -sSL https://get.docker.com/ | sh
```

The public **Keymaster** image is [theconnman/keymaster](https://hub.docker.com/r/theconnman/keymaster/). The `roles.json` file created above needs to be injected as a volume for the Docker container as well. An example command to pull and run it is below which assumes `roles.json` is in a folder named `roles`:
```bash
docker run -d -p 80:1337 -e SLASH_TOKEN=[my-slash-token] -e AUDIT_WEBHOOK=[my-incoming-webhook] -e AWS_ACCESS_KEY_ID=[access-key] -e AWS_SECRET_ACCESS_KEY=[secret-key] -v /path/to/roles.json:/usr/src/app/roles/roles.json --name keymaster theconnman/keymaster:latest
```

You can change the port as needed to satisfy the HTTPS requirement of Slack.

### Environment Variables
- **AWS_ACCESS_KEY_ID** - AWS access key to assume roles
- **AWS_SECRET_ACCESS_KEY** - AWS secret key to assume roles
- **SLASH_TOKEN** - Slash command token (found during Slash command setup)
- **DEFAULT_KEY_LIFE_SECONDS** (default: 3600) - Default lifetime of temporary keys in seconds
- **AUDIT_WEBHOOK** (optional) - Audit channel Slack Webhook
- **AUDIT_CHANNEL** (optional) - Audit channel (defaults to the default channel from the audit webhook)
- **AUDIT_BOT_NAME** (optional, default: Keymaster) - Audit channel bot name
