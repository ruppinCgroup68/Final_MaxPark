using MaxPark.BL;
using System.Data.SqlClient;
using System.Data;
using System.Text.Json;
using System.Dynamic;

namespace MaxPark.DAL
{
    public class DBservicesEvent
    {
        /// <summary>
        /// DBServices is a class created by me to provides some DataBase Services
        /// </summary>
        public DBservicesEvent()
        {
            //
            // TODO: Add constructor logic here
            //
        }

        //--------------------------------------------------------------------------------------------------
        // This method creates a connection to the database according to the connectionString name in the web.config 
        //--------------------------------------------------------------------------------------------------
        public SqlConnection connect(String conString)
        {

            // read the connection string from the configuration file
            IConfigurationRoot configuration = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json").Build();
            string cStr = configuration.GetConnectionString("myProjDB");
            SqlConnection con = new SqlConnection(cStr);
            con.Open();
            return con;
        }

        //--------------------------------------------------------------------------------------------------
        //                              Read - Events
        //--------------------------------------------------------------------------------------------------
        public List<Event> ReadEvents()
        {
            SqlConnection con;
            SqlCommand cmd;
            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }
            List<Event> events = new List<Event>();
            cmd = buildReadStoredProcedureCommand(con, "spReadEvents");
            SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
            while (dataReader.Read())
            {
                Event e = new Event();
                e.EventId = Convert.ToInt32(dataReader["eventId"]);
                e.UserId = Convert.ToInt32(dataReader["userId"]);
                e.ParkId = Convert.ToInt32(dataReader["parkId"]);
                e.MarkId = Convert.ToInt32(dataReader["markId"]);
                e.Event_Date = Convert.ToDateTime(dataReader["event_Date"]);                   
                e.Event_STime = dataReader["event_STime"].ToString();
                e.Event_ETime = dataReader["event_ETime"].ToString();
                e.EvenType = dataReader["evenType"].ToString();
                e.Event_Note = dataReader["event_Note"].ToString();

                events.Add(e);
            }

            if (con != null)
            {
                // close the db connection
                con.Close();
            }

            return events;
        }

        //--------------------------------------------------------------------------------------------------

        SqlCommand buildReadStoredProcedureCommand(SqlConnection con, string spName)
        {
            SqlCommand cmd = new SqlCommand();// create the command object
            cmd.Connection = con;// assign the connection to the command object
            cmd.CommandText = spName;// can be Select, Insert, Update, Delete 
            cmd.CommandTimeout = 10;// Time to wait for the execution' The default is 30 seconds
            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text
            return cmd;
        }
    }
}
