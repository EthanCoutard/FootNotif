# app.py
from core.database import Database
from core.football_api import FootballDataClient
from core.mailer import Mailer
from core.service import Service
from api.api import createApp
import uvicorn


def main():
    db = Database()
    err = db.initDb()
    if err is not None:
        print("Error initializing database")
        return

    footballApi = FootballDataClient()
    mailer = Mailer()
    service = Service(db, mailer, footballApi)

    app = createApp(service)
    uvicorn.run(app, host="127.0.0.1", port=8000)


if __name__ == "__main__":
    main()