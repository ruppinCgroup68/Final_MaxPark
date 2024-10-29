using MaxPark.DAL;
using System.Diagnostics;

namespace MaxPark.BL
{
    public class Event
    {
        int eventId;
        int userId;
        int parkId;
        int markId;
        DateTime event_Date;
        string event_STime;
        string event_ETime;
        string evenType;
        string event_Note;

        public Event()
        {

        }

        public Event(int eventId, int userId, int parkId, int markId, DateTime event_Date, string event_STime, string event_ETime, string evenType, string event_Note)
        {
            EventId = eventId;
            UserId = userId;
            ParkId = parkId;
            MarkId = markId;
            Event_Date = event_Date;
            Event_STime = event_STime;
            Event_ETime = event_ETime;
            EvenType = evenType;
            Event_Note = event_Note;
        }

        public int EventId { get => eventId; set => eventId = value; }
        public int UserId { get => userId; set => userId = value; }
        public int ParkId { get => parkId; set => parkId = value; }
        public int MarkId { get => markId; set => markId = value; }
        public DateTime Event_Date { get => event_Date; set => event_Date = value; }
        public string Event_STime { get => event_STime; set => event_STime = value; }
        public string Event_ETime { get => event_ETime; set => event_ETime = value; }
        public string EvenType { get => evenType; set => evenType = value; }
        public string Event_Note { get => event_Note; set => event_Note = value; }

        public List<Event> Read()
        {
            DBservicesEvent dbs = new DBservicesEvent();
            return dbs.ReadEvents();
        }
    }
}



/*
 
CREATE TABLE [tblEvent](
[eventId]  INT IDENTITY(1,1) PRIMARY KEY,
[userId] INT FOREIGN KEY REFERENCES [tblUser]([userId])NOT NULL,
[parkId] INT FOREIGN KEY REFERENCES [tblParkingCar]([parkId]) NOT NULL,
[markId] INT FOREIGN KEY REFERENCES [tblMark]([markId]) ,
[evenType] NVARCHAR(20),
[reservationDate] DATETIME,
[reservation_STime] TIME,
[reservation_ETime] TIME,
[eventNote] NVARCHAR(100),
Constraint CK10_ CHECK(evenType in ('רכב חורג מזמני חניה מותרים','רכב חוסם רכב אחר','רכב לא נמצא במקומו','רכב לא הגיע מעל חצי שעה','רכב מתפרץ','אחר'))
); 
 
 */