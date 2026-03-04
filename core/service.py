from datetime import datetime, timedelta


class Service():
    def __init__(self, db, mailer, footballApi):
        self.db = db
        self.mailer = mailer
        self.footballApi = footballApi

        self.CheckTeamsInDb()



    def CheckTeamsInDb(self):

        status, err = self.db.isTeamsEmpty()
        if err is not None:
            print(err)
            return err
        
        if status == 0:
            print("Teams déjà présentes")
            return

        teams, err = self.footballApi.GetTeams()

        if err is not None:
            print(f"Erreur récupération équipes: {err}")
            return

        success, err = self.db.insertTeamsinfos(teams)

        if err is not None:
            print(f"Erreur insertion DB: {err}")
            return

        print(f"{len(teams)} équipes ajoutées")
    
            
    def addSubscribers(self, email, frequency):
        err = self.db.insertSubscribers(email, frequency)
        if err is not None:
            print(f"Erreur lors de l'ajout du subscribers email: {email} err: {err}")
            return err
        return "Subscribers ajouté avec succès" 
    

    def addSubscription(self, email, teams):

        subscriber, err = self.db.getSubscribersByEmail(email)
        if err is not None or subscriber is None:
            print(f"Erreur lors de la récupération de l'id {err}")

        for team in teams:
            teamId, err = self.db.getTeamsId(team)
            if err is not None or teamId is None:
                print(f"Erreur lors de la recherche de la team {team}: {err}")
                continue
        

            status, err = self.db.insertSubscriptions(subscriber, teamId)
            if err is not None:
                print(f"Erreur lors de l'ajout de cette subscription: {err}")
                continue

            return f"Subscription ajoutée avec succès"


    def getSendtoday(self):
        isSunday = datetime.now().weekday() == 6
        frequencies = ["daily", "weekly"] if isSunday else ["daily"]
        emailSend = []
        subscribers, err = self.db.getAllSubscribersForFrequency(frequencies)
        if err is not None or subscribers is None:
            print(f"Erreur lors de la récupération des abonnés: {err}")
            return f"Erreur lors de la récupération des abonnés: {err}"
        emailSend.append(subscribers)


        for subscriber in subscribers:
            teamsIds, err = self.db.getsubscribersTeams(subscriber["id"])
            if not teamsIds:
                continue

            now = datetime.now()
            toDay = now.strftime("%Y-%d-%m")
            delta = 1 if subscriber["frequency"] == "daily" else 7
            tomorrow = (now + timedelta(days=delta)).strftime("%Y-%d-%m")

            matchesEmail = []

            for team_id in teamsIds:
                matches, err = self.footballApi.GetMatchesDays(toDay, tomorrow, team_id)
                if err is None and matches is None:
                    continue
                if err is not None:
                    print(f"Erreur récupération matches team {team_id}: {err}")
                    return f"Erreur récupération matches team {team_id}: {err}"
                    continue

                if matches:
                    matchesEmail.extend(matches)

            if not matchesEmail:
                continue

            err = self.mailer.envoieMail(matchesEmail, subscriber["email"])
            if err is not None:
                print(f"Erreur lors de l'envoi du mail: {err}")
                return f"Erreur lors de l'envoi du mail: {err}"
        return emailSend
    def getTeamsOfsubscribers(self, subscribersEmail):
            subscribersId, err = self.db.getSubscribersByEmail(subscribersEmail)
            if err is not None:
                print(f"Erreur lors de la récupération de l'id via l'email")
                return None
            teamsIds, err = self.db.getsubscribersTeams(subscribersId)
            if err is not None:
                print(f"Erreur lors de la récupération des teams de l'utilisateur: {err}")
                return None
            return teamsIds
    
    def getNameTeamsOfSubscribers(self, subscribersEmail):
            subscribersId, err = self.db.getSubscribersByEmail(subscribersEmail)
            if err is not None:
                print(f"Erreur lors de la récupération de l'id via l'email")
                return None
            teamsNames, err = self.db.getsubscribersTeamsNames(subscribersId)
            if err is not None:
                print(f"Erreur lors de la récupération des teams de l'utilisateur: {err}")
                return None
            return teamsNames
    
    def deleteTeamsOfSubscribers(self, subscribersEmail, team):
            subscribersId, err = self.db.getSubscribersByEmail(subscribersEmail)
            if err is not None:
                print(f"Erreur lors de la récupération de l'id via l'email")
                return None
            teamid, err = self.db.getTeamsId(team[0])
            if err is not None:
                print("erreur lors de la recherche de l'id de la team")
                return None
            err = self.db.deleteTeamFromSubscribtion(subscribersId, teamid)
            if err is not None:
                return None
            return True
    
    def deleteSubscribers(self, subscribersEmail):
            subscribersId, err = self.db.getSubscribersByEmail(subscribersEmail)
            if err is not None:
                print(f"Erreur lors de la récupération de l'id via l'email")
                return None
            err = self.db.deleteSubscribers(subscribersId)
            if err is not None:
                return None
            return True
    
    def getAllSubscribers(self):
        subscribers, err = self.db.getAllSubscribers()
        if err is not None:
            print(f"Erreur lors de la récupération des subscribers")
            return None
        return subscribers