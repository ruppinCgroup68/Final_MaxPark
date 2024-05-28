using projMaxPark.BL;
using System;
using System.Data;
using System.Data.SqlClient;

namespace projMaxPark.DAL
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
        //                     R E A D - R E S E R V A T I O N S    &&   U S E R S
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
                    var UserFullName = dataReader["Full Name"];
                    var UserId = dataReader["userId"];
                    var Reservation_STime = dataReader["reservation_STime"];
                    var Reservation_ETime = dataReader["reservation_ETime"];
                    var markId = dataReader["markId"];

                    int parsedMarkId = markId != DBNull.Value ? Convert.ToInt32(markId) : 0;


                    listObjects.Add(new
                    {
                        ReservationId = ReservationId != DBNull.Value ? Convert.ToInt32(ReservationId) : 0,
                        UserFullName = UserFullName != DBNull.Value ? UserFullName.ToString() : string.Empty,
                        UserId = UserId != DBNull.Value ? Convert.ToInt32(UserId) : 0,
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
        //                            R E A D - T O M O R R O W : R E S E R V A T I O N S - G E T
        //---------------------------------------------------------------------------------------------------
        public List<Reservation> readTommorowReservations()
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

            cmd = readTomorrowReservasionSP("spTommorowReadReservation", con);
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
        //                             I N S E R T - R E S E R V A T I O N - P O S T 
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
            cmd.CommandTimeout = 10;           // Time to wait for the execution' The default is 30 seconds
            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text
            cmd.Parameters.AddWithValue("@userId", reservation.UserId);
            //cmd.Parameters.AddWithValue("@parkId", reservation.ParkId);
            cmd.Parameters.AddWithValue("@reservationDate", reservation.Reservation_Date);
            cmd.Parameters.AddWithValue("@reservation_STime", reservation.Reservation_STime);
            cmd.Parameters.AddWithValue("@reservation_ETime", reservation.Reservation_ETime);
            return cmd;
        }


        //--------------------------------------------------------------------------------------------------
        //                             U P D A T E - R E S E R V A T I O N 
        //--------------------------------------------------------------------------------------------------  
        public int updateReservation(Reservation currentReservation)
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
            cmd = UpdateResWithStoredProcedure("spUpdateTimeReservation", con, currentReservation);// create the command
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