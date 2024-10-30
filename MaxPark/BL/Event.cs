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

        public int InsertEvent(Event eve)
        {
            DBservicesEvent dbs=new DBservicesEvent();
            return dbs.InsertEvent(eve);
        }
    }
}
