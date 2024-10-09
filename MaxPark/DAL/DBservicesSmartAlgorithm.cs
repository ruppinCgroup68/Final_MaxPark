using MaxPark.BL;
using System.Data.SqlClient;
using System.Data;
using System.Text.Json;
using System.Dynamic;

namespace MaxPark.DAL
{
    public class DBservicesSmartAlgorithm
    {
        /// <summary>
        /// DBServices is a class created by me to provides some DataBase Services
        /// </summary>
        public DBservicesSmartAlgorithm()
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
        //                            R E A D - D A I L Y    R E S E R V A T I O N 
        //---------------------------------------------------------------------------------------------------
        public List<Reservation> getTomorrowReservations_SmartAlgo()
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

            cmd = CreateDailyListForAlgorithmSP("spReadTommorowReservations", con);
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
        private SqlCommand CreateDailyListForAlgorithmSP(String spName, SqlConnection con)
        {
            SqlCommand cmd = new SqlCommand();// create the command object-
            cmd.Connection = con;// assign the connection to the command object
            cmd.CommandText = spName;// can be Select, Insert, Update, Delete 
            cmd.CommandTimeout = 10;// Time to wait for the execution' The default is 30 seconds
            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be stored procedure
            return cmd;
        }



        //--------------------------------------------------------------------------------------------------
        //                            R E A D - M A R K S  
        //---------------------------------------------------------------------------------------------------
        public List<Mark> getParkingMarks()
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

            cmd = ReadParkingMarksSP("spReadParkingMarks", con);
            try
            {
                SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
                List<Mark> marks = new List<Mark>();
                while (dataReader.Read())
                {
                    Mark mark = new Mark();
                    mark.MarkId = Convert.ToInt32(dataReader["markId"]);
                    mark.MarkName = dataReader["markName"].ToString();
                    mark.MarkName_Block = dataReader["markName_Block"].ToString();
                    mark.ParkId = Convert.ToInt32(dataReader["parkId"]);
                    mark.IsAvailable = Convert.ToBoolean(dataReader["isAvailable"]);
                    marks.Add(mark);
                }
                return marks;
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

        private SqlCommand ReadParkingMarksSP(String spName, SqlConnection con)
        {
            SqlCommand cmd = new SqlCommand();// create the command object-
            cmd.Connection = con;// assign the connection to the command object
            cmd.CommandText = spName;// can be Select, Insert, Update, Delete 
            cmd.CommandTimeout = 10;// Time to wait for the execution' The default is 30 seconds
            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be stored procedure
            return cmd;
        }

        //---------------------------------------------------------------------------------------------------
        //                             U P D A T E   R E S E R V A T I O N   S T A T U S 
        //---------------------------------------------------------------------------------------------------

        public int UpdateReservationStatus(Reservation res)
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
            cmd = spUpdateResStatus("spUpdateResStatus", con, res);// create the command
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
        private SqlCommand spUpdateResStatus(String spName, SqlConnection con, Reservation res)
        {
            SqlCommand cmd = new SqlCommand(); // create the command object
            cmd.Connection = con;// assign the connection to the command object
            cmd.CommandText = spName;// can be Select, Insert, Update, Delete 
            cmd.CommandTimeout = 10; // Time to wait for the execution' The default is 30 seconds
            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text
            cmd.Parameters.AddWithValue("@reservationId", res.ReservationId);
            cmd.Parameters.AddWithValue("@reservationStatus", res.Reservation_Status);
            return cmd;
        }


        //--------------------------------------------------------------------------------------------------
        //                             U P D A T E   R E S E R V A T I O N   M A R K I D 
        //---------------------------------------------------------------------------------------------------

        public int UpdateReservationMarkId(Reservation res)
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
            cmd = spUpdateResMarkId("spUpdateResMarkId", con, res);// create the command
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
        private SqlCommand spUpdateResMarkId(String spName, SqlConnection con, Reservation res)
        {
            SqlCommand cmd = new SqlCommand(); // create the command object
            cmd.Connection = con;// assign the connection to the command object
            cmd.CommandText = spName;// can be Select, Insert, Update, Delete 
            cmd.CommandTimeout = 10; // Time to wait for the execution' The default is 30 seconds
            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text
            cmd.Parameters.AddWithValue("@reservationId", res.ReservationId);
            cmd.Parameters.AddWithValue("@markId", res.MarkId);
            return cmd;
        }

        //--------------------------------------------------------------------------------------------------
        //                             U P D A T E   M A R K S   I S A V A L I A B L E  
        //---------------------------------------------------------------------------------------------------

        public int UpdateIsAvailableMark(Mark mark)
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
            cmd = spUpdateAvailable("spUpdateIsAvailableMark", con, mark);// create the command
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
        private SqlCommand spUpdateAvailable(String spName, SqlConnection con, Mark mark)
        {
            SqlCommand cmd = new SqlCommand(); // create the command object
            cmd.Connection = con;// assign the connection to the command object
            cmd.CommandText = spName;// can be Select, Insert, Update, Delete 
            cmd.CommandTimeout = 10; // Time to wait for the execution' The default is 30 seconds
            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text
            cmd.Parameters.AddWithValue("@markId", mark.MarkId);
            cmd.Parameters.AddWithValue("@isAvailable", mark.IsAvailable);
            return cmd;
        }


        //--------------------------------------------------------------------------------------------------
        //                            R E A D - U P D A T E D   R E S E R V A T I O N S 
        //---------------------------------------------------------------------------------------------------
        public Object getUpdatedReservations()
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

            cmd = readResMarkUpdatedList("spReadReservationMarkUpdatedList", con);
            try
            {
                SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

                List<Object> listObjects = new List<Object>();
                while (dataReader.Read())
                {
                    var reservationId = dataReader["reservationId"];
                    var userFullName = dataReader["userFullName"];
                    var userId = dataReader["userId"];
                    var reservationDate = dataReader["reservationDate"];
                    var reservation_STime = dataReader["reservation_STime"];
                    var reservation_ETime = dataReader["reservation_ETime"];
                    var reservationStatus = dataReader["reservationStatus"];
                    var markId = dataReader["markId"];
                    var markName = dataReader["markName"];
                    var markName_Block = dataReader["markName_Block"];
                    var isAvailable = dataReader["isAvailable"];

                    int parsedMarkId = markId != DBNull.Value ? Convert.ToInt32(markId) : 0;

                    listObjects.Add(new
                    {
                        reservationId = reservationId != DBNull.Value ? Convert.ToInt32(reservationId) : 0,
                        userFullName = userFullName != DBNull.Value ? userFullName.ToString() : string.Empty,
                        userId = userId != DBNull.Value ? Convert.ToInt32(userId) : 0,
                        reservationDate = reservationDate != DBNull.Value ? Convert.ToDateTime(reservationDate) : DateTime.MinValue,
                        reservation_STime = reservation_STime != DBNull.Value ? reservation_STime.ToString() : string.Empty,
                        reservation_ETime = reservation_ETime != DBNull.Value ? reservation_ETime.ToString() : string.Empty,
                        reservationStatus = reservationStatus != DBNull.Value ? reservationStatus.ToString() : string.Empty,
                        markId = parsedMarkId,
                        markName = parsedMarkId == 0 ? "Null" : (markName != DBNull.Value ? markName.ToString() : string.Empty),
                        markName_Block = parsedMarkId == 0 ? "-" : (markName_Block != DBNull.Value ? markName_Block.ToString() : string.Empty),
                        isAvailable = parsedMarkId == 0 ? false : (isAvailable != DBNull.Value ? Convert.ToBoolean(isAvailable) : false)
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
        private SqlCommand readResMarkUpdatedList(String spName, SqlConnection con)
        {
            SqlCommand cmd = new SqlCommand();// create the command object-
            cmd.Connection = con;// assign the connection to the command object
            cmd.CommandText = spName;// can be Select, Insert, Update, Delete 
            cmd.CommandTimeout = 10;// Time to wait for the execution' The default is 30 seconds
            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be stored procedure
            return cmd;
        }
    }
}
