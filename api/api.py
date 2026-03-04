from fastapi import FastAPI
from pydantic import BaseModel


class Subscribers(BaseModel):
    email: str
    frequency: str


class Subscriptions(BaseModel):
    email: str
    teams: list


def createApp(service):

    app = FastAPI()

    @app.get("/")
    def read_root():
        return {"Hello": "World"}

    @app.get("/getTeamsOfSubscribers/{email}")
    def getTeamsOfSubscribers(email: str):
        teams = service.getNameTeamsOfSubscribers(email)
        return {"teams": teams}

    @app.post("/addSubscribers")
    def addSubscribers(subscribers: Subscribers):
        message = service.addSubscribers(
            email=subscribers.email,
            frequency=subscribers.frequency
        )
        return {"message": message}

    @app.post("/addSubscriptions")
    def addSubscriptions(subscriptions: Subscriptions):
        message = service.addSubscription(
            email=subscriptions.email,
            teams=subscriptions.teams
        )
        return {"message": message}
    
    @app.delete("/deleteTeamsOfSubscribers")
    def deleteTeamsOfSubscribers(subscriptions: Subscriptions):
        status = service.deleteTeamsOfSubscribers(
            subscribersEmail=subscriptions.email,
            team=subscriptions.teams
        )
        return{"message": status}
    
    @app.delete("/deleteSubscribers")
    def deleteSubscribers(email: str):
        status = service.deleteSubscribers(email)
        return{"message:": status}
    
    @app.get("/getAllSubscribers")
    def getAllSubscribers():
        subscribers = service.getAllSubscribers()
        return{"message": "Récupération réussi",
               "subscribers": subscribers}
    
    @app.post("/sendMail")
    def sendMail():
        message = service.getSendtoday()
        return {"message": message}
    
    return app