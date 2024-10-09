using MaxPark.BL;
using System;
using System.Data;
using System.Data.SqlClient;

namespace MaxPark.DAL
{
    public class DBservicesReservation
    {
        public DBNull MarkId { get; private set; }
        public DBNull ReservationStatus { get; private set; }

        /// <summary>
        /// DBServices is a class created by me to provides some DataBase Services
        /// </summary>
        public DBservicesReservation()
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
        //                     get reservationn && marks as Object
        //---------------------------------------------------------------------------------------------------
        public Object readReservations()
        {
            SqlConnection con;
            SqlCommand cmd;
            try
            {
                con = connect("myProjDB");//create the connection
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }

            // helper method to build the insert string
            // create the command

            cmd = readReservasionSP("spReadReservations", con);
            try
            {
                SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

                List<Object> listObjects = new List<Object>();

                while (dataReader.Read())
                {
                    var ReservationId = dataReader["reservationId"];
                    var UserFirstName = dataReader["userFirstName"];
                    var UserLastName = dataReader["userLastName"];
                    var UserId = dataReader["userId"];
                    var Reservation_Date = dataReader["reservationDate"]
; var Reservation_STime = dataReader["reservation_STime"];
                    var Reservation_ETime = dataReader["reservation_ETime"];
                    var markId = dataReader["markId"];

                    int parsedMarkId = markId != DBNull.Value ? Convert.ToInt32(markId) : 0;


                    listObjects.Add(new
                    {
                        ReservationId = ReservationId != DBNull.Value ? Convert.ToInt32(ReservationId) : 0,
                        UserFirstName = UserFirstName != DBNull.Value ? UserFirstName.ToString() : string.Empty,
                        UserLastName = UserLastName != DBNull.Value ? UserLastName.ToString() : string.Empty,
                        UserId = UserId != DBNull.Value ? Convert.ToInt32(UserId) : 0,
                        Reservation_Date = Reservation_Date != DBNull.Value ? Reservation_Date.ToString() : string.Empty,
                        Reservation_STime = Reservation_STime != DBNull.Value ? Reservation_STime.ToString() : string.Empty,
                        Reservation_ETime = Reservation_ETime != DBNull.Value ? Reservation_ETime.ToString() : string.Empty,
                        markId = parsedMarkId

                    });

                }
                return listObjects;
            }

            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }
            finally
            {
                if (con != null)
                {
                    // close the db connection
                    con.Close();
                }
            }
        }

        //---------------------------------------------------------------------------------------------------
        private SqlCommand readReservasionSP(String spName, SqlConnection con)
        {
            SqlCommand cmd = new SqlCommand();// create the command object-
            cmd.Connection = con;// assign the connection to the command object
            cmd.CommandText = spName;// can be Select, Insert, Update, Delete 
            cmd.CommandTimeout = 10;// Time to wait for the execution' The default is 30 seconds
            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be stored procedure
            return cmd;
        }

        //--------------------------------------------------------------------------------------------------
        //                            get reservation by userID
        //---------------------------------------------------------------------------------------------------
        public List<Object> readReservationsByUserId(int userId)
        {
            SqlConnection con;
            SqlCommand cmd;
            try
            {
                con = connect("myProjDB");//create the connection
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }

            // helper method to build the insert string
            // create the command

            cmd = readReservasionByUserIdSP("spReadReservationByUserId", con, userId);
            try
            {
                SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
                List<Object> reservations = new List<Object>();
                while (dataReader.Read())
                {
                    Object res = new
                    {
                        reservationId = dataReader["reservationId"] != DBNull.Value ? Convert.ToInt32(dataReader["reservationId"]) : (int?)null,
                        userId = dataReader["userId"] != DBNull.Value ? Convert.ToInt32(dataReader["userId"]) : (int?)null,
                        parkId = dataReader["parkId"] != DBNull.Value ? Convert.ToInt32(dataReader["parkId"]) : (int?)null,
                        reservation_Date = dataReader["reservationDate"] != DBNull.Value ? Convert.ToDateTime(dataReader["reservationDate"]) : (DateTime?)null,
                        reservation_STime = dataReader["reservation_STime"] != DBNull.Value ? dataReader["reservation_STime"].ToString() : null,
                        reservation_ETime = dataReader["reservation_ETime"] != DBNull.Value ? dataReader["reservation_ETime"].ToString() : null,
                        reservationStatus = dataReader["reservationStatus"] != DBNull.Value ? dataReader["reservationStatus"].ToString() : null,
                        markId = dataReader["markId"] != DBNull.Value ? Convert.ToInt32(dataReader["markId"]) : (int?)null,
                        parkName = dataReader["parkName"] != DBNull.Value ? dataReader["parkName"].ToString() : null,
                        parkAddress = dataReader["parkAddress"] != DBNull.Value ? dataReader["parkAddress"].ToString() : null,
                        markName = dataReader["markName"] != DBNull.Value ? dataReader["markName"].ToString() : null,
                        markName_Block = dataReader["markName_Block"] != DBNull.Value ? dataReader["markName_Block"].ToString() : null,
                        isAvailable = dataReader["isAvailable"] != DBNull.Value ? Convert.ToBoolean(dataReader["isAvailable"]) : (bool?)null
                    };


                    reservations.Add(res);
                }
                return reservations;
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }
            finally
            {
                if (con != null)
                {
                    // close the db connection
                    con.Close();
                }
            }
        }

        //---------------------------------------------------------------------------------------------------
        private SqlCommand readReservasionByUserIdSP(String spName, SqlConnection con, int userId)
        {
            SqlCommand cmd = new SqlCommand();// create the command object-
            cmd.Connection = con;// assign the connection to the command object
            cmd.CommandText = spName;// can be Select, Insert, Update, Delete 
            cmd.CommandTimeout = 10;// Time to wait for the execution' The default is 30 seconds
            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be stored procedure
            cmd.Parameters.AddWithValue("@userId", userId);
            return cmd;
        }

        //--------------------------------------------------------------------------------------------------
        //                             check parking notifications
        //---------------------------------------------------------------------------------------------------
        public List<ParkingNotification> CheckParkingNotifications()
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

            cmd = CheckParkingNotificationsSP("spCheckParkingNotifications", con); // create the command

            try
            {
                SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
                List<ParkingNotification> notifications = new List<ParkingNotification>();

                while (dataReader.Read())
                {
                    var notification = new ParkingNotification
                    {
                        ReservationId = dataReader["reservationId"] != DBNull.Value ? Convert.ToInt32(dataReader["reservationId"]) : 0,
                        NotificationCode = dataReader["notificationCode"] != DBNull.Value ? dataReader["notificationCode"].ToString() : null
                    };

                    // Add the notification to your list or process it further
                    notifications.Add(notification);
                }

                return notifications;
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }
            finally
            {
                if (con != null)
                {
                    // close the db connection
                    con.Close();
                }
            }
        }

        public class ParkingNotification
        {
            public string NotificationCode { get; set; }
            public int ReservationId { get; set; } // Adjust the type according to your database schema
        }

        //---------------------------------------------------------------------------------------------------
        private SqlCommand CheckParkingNotificationsSP(String spName, SqlConnection con)
        {
            SqlCommand cmd = new SqlCommand(); // create the command object
            cmd.Connection = con; // assign the connection to the command object
            cmd.CommandText = spName; // can be Select, Insert, Update, Delete 
            cmd.CommandTimeout = 10; // Time to wait for the execution' The default is 30 seconds
            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be stored procedure
            return cmd;
        }

        //--------------------------------------------------------------------------------------------------------------------------------------//
        //                                  R E A D - T O M O R R O W S  :  R E S E R V A T I O N 
        //-------------------------------------------------------------------------------------------------------------------------------------//
        public List<Reservation> getTomorrowReservations()
        {
            SqlConnection con;
            SqlCommand cmd;
            try
            {
                con = connect("myProjDB");//create the connection
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }

            // helper method to build the insert string
            // create the command

            cmd = readTomorrowReservasionSP("spGetTomorrowReservations", con);
            try
            {
                SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
                List<Reservation> reservations = new List<Reservation>();
                while (dataReader.Read())
                {
                    Reservation res = new Reservation();
                    res.ReservationId = Convert.ToInt32(dataReader["reservationId"]);
                    res.UserId = Convert.ToInt32(dataReader["userId"]);
                    res.ParkId = Convert.ToInt32(dataReader["parkId"]);
                    res.Reservation_Date = Convert.ToDateTime(dataReader["reservationDate"]);
                    res.Reservation_STime = dataReader["reservation_STime"].ToString();
                    res.Reservation_ETime = dataReader["reservation_ETime"].ToString();
                    if (dataReader["markId"] != DBNull.Value)
                    {
                        res.MarkId = Convert.ToInt32(dataReader["markId"]);
                    }
                    if (dataReader["reservationStatus"] != DBNull.Value)
                    {
                        res.Reservation_Status = dataReader["reservationStatus"].ToString();
                    }

                    reservations.Add(res);
                }

                return reservations;
            }

            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }

            finally
            {
                if (con != null)
                {
                    // close the db connection
                    con.Close();
                }
            }
        }
        //---------------------------------------------------------------------------------------------------

        private SqlCommand readTomorrowReservasionSP(String spName, SqlConnection con)
        {
            SqlCommand cmd = new SqlCommand();// create the command object-
            cmd.Connection = con;// assign the connection to the command object
            cmd.CommandText = spName;// can be Select, Insert, Update, Delete 
            cmd.CommandTimeout = 10;// Time to wait for the execution' The default is 30 seconds
            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be stored procedure
            return cmd;
        }

        //--------------------------------------------------------------------------------------------------
        //                             I N S E R T  :   R E S E R V A T I O N 
        //---------------------------------------------------------------------------------------------------
        public int InsertReservation(Reservation reservation)
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

            cmd = CreateInsertReservation("spInsertReservation", con, reservation); //create the command

            try
            {
                int numEffected = cmd.ExecuteNonQuery(); //execute the command
                return numEffected;
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }
            finally
            {
                if (con != null)
                {
                    // close the db connection
                    con.Close();
                }
            }
        }

        //--------------------------------------------------------------------------------------------------
        private SqlCommand CreateInsertReservation(String spName, SqlConnection con, Reservation reservation)
        {
            SqlCommand cmd = new SqlCommand(); // create the command object
            cmd.Connection = con; // assign the connection to the command object
            cmd.CommandText = spName; // can be Select, Insert, Update, Delete 
            cmd.CommandTimeout = 10;// Time to wait for the execution' The default is 30 seconds
            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text
            cmd.Parameters.AddWithValue("@userId", reservation.UserId);
            cmd.Parameters.AddWithValue("@parkId", reservation.ParkId);
            cmd.Parameters.AddWithValue("@reservationDate", reservation.Reservation_Date);
            cmd.Parameters.AddWithValue("@reservation_STime", reservation.Reservation_STime);
            cmd.Parameters.AddWithValue("@reservation_ETime", reservation.Reservation_ETime);
            return cmd;
        }


        //--------------------------------------------------------------------------------------------------
        //                             U P D A T E - R E S E R V A T I O N 
        //--------------------------------------------------------------------------------------------------  
        public int updateReservationDateTime(Reservation currentReservation)
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
            cmd = UpdateResWithStoredProcedure("spUpdateDateTimeReservation", con, currentReservation);// create the command
            try
            {
                int numEffected = cmd.ExecuteNonQuery(); // execute the command
                return numEffected;
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }

            finally
            {
                if (con != null)
                {
                    // close the db connection
                    con.Close();
                }
            }
        }
        //--------------------------------------------------------------------------------------------------
        private SqlCommand UpdateResWithStoredProcedure(String spName, SqlConnection con, Reservation res)
        {
            SqlCommand cmd = new SqlCommand(); // create the command object
            cmd.Connection = con;// assign the connection to the command object
            cmd.CommandText = spName;// can be Select, Insert, Update, Delete 
            cmd.CommandTimeout = 10; // Time to wait for the execution' The default is 30 seconds
            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text
            cmd.Parameters.AddWithValue("@reservationId", res.ReservationId);
            cmd.Parameters.AddWithValue("@reservationDate", res.Reservation_Date);
            cmd.Parameters.AddWithValue("@Reservation_STime", res.Reservation_STime);
            cmd.Parameters.AddWithValue("@Reservation_ETime", res.Reservation_ETime);
            return cmd;
        }

        //--------------------------------------------------------------------------------------------------
        //                            D E L E T E  R E S E R V A T I O N 
        //--------------------------------------------------------------------------------------------------  
        public int cancleReservation(int id)
        {
            SqlConnection con;
            SqlCommand cmd;
            try
            {
                con = connect("myProjDB");//create the connection
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }
            cmd = DeleteWithStoredProcedure("spDeleteReservation", con, id);//create the command
            try
            {
                int numEffected = cmd.ExecuteNonQuery();//execute the command
                return numEffected;
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }
            finally
            {
                if (con != null)
                {
                    con.Close();
                }
            }
        }


        //---------------------------------------------------------------------------------
        private SqlCommand DeleteWithStoredProcedure(String spName, SqlConnection con, int reservationid)
        {
            SqlCommand cmd = new SqlCommand();//create the command object
            cmd.Connection = con;// assign the connection to the command object
            cmd.CommandText = spName;//can be Select, Insert, Update, Delete 
            cmd.CommandTimeout = 10; //Time to wait for the execution' The default is 30 seconds
            cmd.CommandType = System.Data.CommandType.StoredProcedure;//the type of the command, can also be text
            cmd.Parameters.AddWithValue("@id", reservationid);
            return cmd;
        }
    }
}
