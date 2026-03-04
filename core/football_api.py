import requests
from config import *
import json
import time
import locale
import datetime

class FootballDataClient():
    def __init__(self):
        pass

    def GetTeams(self):

        offset = 0
        limit = 500
        teams = []

        headers = {
            "X-Auth-Token": API_TOKEN
        }
        try :
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

            return teams , None
        except Exception as e:
            return None, e


    def GetMatchesDays(self, startDate, endDate, teams):
        locale.setlocale(locale.LC_TIME, "fr_FR.UTF-8")
        matches = []
        headers = {
                "X-Auth-Token": API_TOKEN
            }
        try:
            if type(teams) == list:
                for team in teams:
                    uri = f"https://api.football-data.org/v4/teams/{team}/matches?dateFrom={startDate}&dateTo={endDate}"
                    

                    response = requests.get(uri, headers=headers)
                    data = response.json()
                    count = data.get("resultSet", {}).get('count', 0)
                    
                    if  count == 0:
                        return None, None

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
                    

                    response = requests.get(uri, headers=headers)
                    data = response.json()

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
            return matches, None    
        except Exception as e:
            return None, e
