import requests
import json
from datetime import datetime
import locale
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import time
import sqlite3
from dotenv import load_dotenv
import os
from pathlib import Path

def envoieMail(matches):
    MATCH_BLOCK = """
<tr>
  <td style="padding:20px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="match-card" style="background-color:#ffffff; border:1px solid #e5e7eb; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <tr>
        <td style="padding:30px 20px 20px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td width="45%" align="center" valign="middle" style="text-align:center;">
                <img src="{{team1_logo}}" alt="{{team1_name}}" width="80" height="80" class="team-logo" style="display:block; max-width:80px; height:auto; border:0; font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#6b7280;">
              </td>
              <td width="10%" align="center" valign="middle" style="text-align:center;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                  <tr>
                    <td class="vs-badge" style="background-color:#f3f4f6; border-radius:50%; padding:8px 12px; font-family:Arial, Helvetica, sans-serif; font-size:13px; font-weight:bold; color:#6b7280; text-align:center; border:2px solid #e5e7eb;">VS</td>
                  </tr>
                </table>
              </td>
              <td width="45%" align="center" valign="middle" style="text-align:center;">
                <img src="{{team2_logo}}" alt="{{team2_name}}" width="80" height="80" class="team-logo" style="display:block; max-width:80px; height:auto; border:0; font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#6b7280;">
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td style="padding:0 20px 20px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td width="45%" align="left" class="team-name" style="font-family:Arial, Helvetica, sans-serif; font-size:16px; font-weight:bold; color:#111827; text-align:left; line-height:1.4;">
                {{team1_name}}
              </td>
              <td width="10%"></td>
              <td width="45%" align="right" class="team-name" style="font-family:Arial, Helvetica, sans-serif; font-size:16px; font-weight:bold; color:#111827; text-align:right; line-height:1.4;">
                {{team2_name}}
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td style="padding:0 20px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td style="border-top:1px solid #e5e7eb; font-size:0; line-height:0;">&nbsp;</td>
            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td align="center" style="padding:20px;">
          <p style="margin:0 0 8px; font-family:Arial, Helvetica, sans-serif; font-size:15px; font-weight:600; color:#059669; text-align:center;">
            {{match_date}}
          </p>
          <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#6b7280; text-align:center; text-transform:uppercase; letter-spacing:0.5px;">
            {{competition}}
          </p>
        </td>
      </tr>
    </table>
  </td>
</tr>
<tr>
  <td height="10" style="height:10px; font-size:0; line-height:0;">&nbsp;</td>
</tr>
"""

    EMAIL_TEMPLATE = """<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>Football Match Notifications</title>
<style>
  @media only screen and (max-width: 600px) {
    .email-container { width: 100% !important; max-width: 100% !important; }
    .match-card { width: 100% !important; }
    .team-logo { width: 50px !important; height: auto !important; }
    .team-name { font-size: 14px !important; }
    .vs-badge { font-size: 12px !important; padding: 4px 8px !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background-color:#f3f4f6; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%;">
<center>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f3f4f6; margin:0; padding:0;">
    <tr>
      <td align="center" style="padding:20px 10px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="email-container" style="max-width:600px; width:100%; background-color:#ffffff; border-radius:12px; border:1px solid #e5e7eb;">
          <tr>
            <td align="center" style="padding:40px 20px 30px; background-color:#059669; border-radius:12px 12px 0 0;">
              <h1 style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:28px; color:#ffffff; font-weight:bold; text-transform:uppercase; letter-spacing:1px;">Match Notifications</h1>
              <p style="margin:10px 0 0; font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#d1fae5;">Stay updated with upcoming fixtures</p>
            </td>
          </tr>

          {{matches}}

          <tr>
            <td align="center" style="padding:30px 20px; background-color:#f9fafb; border-radius:0 0 12px 12px; border-top:1px solid #e5e7eb;">
              <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#6b7280; text-align:center;">
                You received this notification because you subscribed to match updates.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</center>
</body>
</html>
"""

    matches_html = ""
    for m in matches:
        block = MATCH_BLOCK
        block = block.replace("{{team1_logo}}", m["team1_logo"])
        block = block.replace("{{team2_logo}}", m["team2_logo"])
        block = block.replace("{{team1_name}}", m["team1_name"])
        block = block.replace("{{team2_name}}", m["team2_name"])
        block = block.replace("{{match_date}}", m["match_date"])
        block = block.replace("{{competition}}", m["competition"])
        matches_html += block

    html = EMAIL_TEMPLATE.replace("{{matches}}", matches_html)

    smtpServer = "smtp.gmail.com"
    port = 587
    senderEmail = "ethancoutard@gmail.com"
    appPassword = "maaw kqim arhg tlmf"
    receiverEmail = "riyanchakibi@gmail.com"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Match Notifications"
    msg["From"] = senderEmail
    msg["To"] = receiverEmail
    msg.attach(MIMEText(html, "html", "utf-8"))

    server = smtplib.SMTP(smtpServer, port)
    server.ehlo()
    server.starttls()
    server.ehlo()
    server.login(senderEmail, appPassword)
    server.sendmail(senderEmail, [receiverEmail], msg.as_string())
    server.quit()



def GetMatchesDays(startDate, endDate, teams):
  locale.setlocale(locale.LC_TIME, "fr_FR.UTF-8")
  matches = []

  if type(teams) == list:
      for team in teams:
        uri = f"https://api.football-data.org/v4/teams/{team}/matches?dateFrom={startDate}&dateTo={endDate}"
        headers = { "X-Auth-Token": "ac552564022e4547a432eb881552825c" }

        response = requests.get(uri, headers=headers)
        data = response.json()

        with open("outpout.json", "w", encoding="utf-8") as f:
            json.dump(data.get("matches", []), f, indent=4, ensure_ascii=False)


        for m in data.get("matches", []):
            dt = datetime.strptime(m["utcDate"], "%Y-%m-%dT%H:%M:%SZ")
            dayOfMatch = dt.strftime("%A %d %B %Y")

            homeTeam = m["homeTeam"]["shortName"]
            awayTeam = m["awayTeam"]["shortName"]
            logoHomeTeam = m["homeTeam"]["crest"]
            logoAwayTeam = m["awayTeam"]["crest"]

            competion = m["competition"]["name"]

            matches.append({
                "team1_logo": logoHomeTeam,
                "team2_logo": logoAwayTeam,
                "team1_name": homeTeam,
                "team2_name": awayTeam,
                "match_date": dayOfMatch,
                "competition": competion
            })
      else:
        uri = f"https://api.football-data.org/v4/teams/{teams}/matches?dateFrom={startDate}&dateTo={endDate}"
        headers = { "X-Auth-Token": "ac552564022e4547a432eb881552825c" }

        response = requests.get(uri, headers=headers)
        data = response.json()

        with open("outpout.json", "w", encoding="utf-8") as f:
            json.dump(data.get("matches", []), f, indent=4, ensure_ascii=False)


        for m in data.get("matches", []):
            dt = datetime.strptime(m["utcDate"], "%Y-%m-%dT%H:%M:%SZ")
            dayOfMatch = dt.strftime("%A %d %B %Y")

            homeTeam = m["homeTeam"]["shortName"]
            awayTeam = m["awayTeam"]["shortName"]
            logoHomeTeam = m["homeTeam"]["crest"]
            logoAwayTeam = m["awayTeam"]["crest"]

            competion = m["competition"]["name"]

            matches.append({
                "team1_logo": logoHomeTeam,
                "team2_logo": logoAwayTeam,
                "team1_name": homeTeam,
                "team2_name": awayTeam,
                "match_date": dayOfMatch,
                "competition": competion
            })        
  if len(matches) > 0:
      envoieMail(matches)


def GetTeams():

    offset = 0
    limit = 500
    teams = []

    headers = {
        "X-Auth-Token": os.getenv("ApiToken")
    }

    while True:

        uri = f"https://api.football-data.org/v4/teams?limit={limit}&offset={offset}"
        response = requests.get(uri, headers=headers)

        if response.status_code == 429:
            print("Rate limit, attente...")
            time.sleep(60)
            continue

        data = response.json()

        if "teams" not in data:
            break

        teams.extend(data["teams"])

        print(f"{len(teams)} teams récupérées")

        if len(data["teams"]) < limit:
            break

        offset += limit
        time.sleep(1)

    with open("all_teams.json", "w", encoding="utf-8") as f:
        json.dump(teams, f, indent=4)

    print("Terminé :", len(teams))


def createDataBase():
    data
    if os.path
        
    

load_dotenv()
GetTeams()


