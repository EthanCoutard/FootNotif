import requests
from config import *
import json
import time
import locale
from datetime import datetime


class FootballDataClient():
    def __init__(self):
        pass

    def getTeams(self):
        offset = 0
        limit = 500
        teams = []

        headers = {"X-Auth-Token": API_TOKEN}

        try:
            while True:
                uri = f"https://api.football-data.org/v4/teams?limit={limit}&offset={offset}"
                response = requests.get(uri, headers=headers)

                if response.status_code == 429:
                    print("Rate limit hit, waiting...")
                    time.sleep(60)
                    continue

                data = response.json()

                if "teams" not in data:
                    break

                teams.extend(data["teams"])
                print(f"{len(teams)} teams fetched")

                if len(data["teams"]) < limit:
                    break

                offset += limit
                time.sleep(1)

            with open("all_teams.json", "w", encoding="utf-8") as f:
                json.dump(teams, f, indent=4)

            return teams, None
        except Exception as e:
            return None, e

    def getMatchesBetweenDates(self, startDate, endDate, teamId):
        locale.setlocale(locale.LC_TIME, "fr_FR.UTF-8")
        matches = []
        headers = {"X-Auth-Token": API_TOKEN}

        try:
            uri = f"https://api.football-data.org/v4/teams/{teamId}/matches?dateFrom={startDate}&dateTo={endDate}"
            response = requests.get(uri, headers=headers)
            data = response.json()

            for m in data.get("matches", []):
                dt = datetime.strptime(m["utcDate"], "%Y-%m-%dT%H:%M:%SZ")
                dayOfMatch = dt.strftime("%A %d %B %Y")

                homeTeam = m["homeTeam"]["shortName"]
                awayTeam = m["awayTeam"]["shortName"]
                logoHomeTeam = m["homeTeam"]["crest"]
                logoAwayTeam = m["awayTeam"]["crest"]
                competition = m["competition"]["name"]

                matches.append({
                    "team1_logo": logoHomeTeam,
                    "team2_logo": logoAwayTeam,
                    "team1_name": homeTeam,
                    "team2_name": awayTeam,
                    "match_date": dayOfMatch,
                    "competition": competition
                })

            return matches, None
        except Exception as e:
            return None, e