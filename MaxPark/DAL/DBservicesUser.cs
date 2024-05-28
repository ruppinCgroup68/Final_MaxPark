using projMaxPark.BL;
using System.Data.SqlClient;
using System.Data;
using System.Text.Json;
using System.Dynamic;

namespace projMaxPark.DAL
{
    public class DBservicesUser
    {
        /// <summary>
        /// DBServices is a class created by me to provides some DataBase Services
        /// </summary>
        public DBservicesUser()
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
        //                            L O G I N  - U S E R S 
        //---------------------------------------------------------------------------------------------------
        public int UserLogin(User user)
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

            cmd = logInSP("spLogInUser", con, user); // create the command

            try
            {
                SqlDataReader reader = cmd.ExecuteReader(); //execute the command

                while (reader.Read())
                {
                    string email = reader["userEmail"].ToString();
                    Boolean isAdmin = Convert.ToBoolean(reader["isAdmin"]);
                    Boolean isManager = Convert.ToBoolean(reader["isParkingManager"]);


                    // 0 = Not Found
                    // 1 = Admin 
                    // 2 = Manager 
                    // 3 = User   

                    if ((isAdmin == true) && (isManager == false))
                    {
                        return 1;
                    }
                    else
                    {
                        if ((isAdmin == false) && (isManager == true))
                        {
                            return 2;
                        }
                    }

                }
                if (reader.HasRows)//חזר משהו 
                    return 3;
                else
                    return 0;
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
        private SqlCommand logInSP(String spName, SqlConnection con, User user)
        {
            SqlCommand cmd = new SqlCommand(); // create the command object
            cmd.Connection = con;// assign the connection to the command object
            cmd.CommandText = spName;// can be Select, Insert, Update, Delete 
            cmd.CommandTimeout = 10; // Time to wait for the execution' The default is 30 seconds
            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text
            cmd.Parameters.AddWithValue("@userEmail", user.UserEmail);
            cmd.Parameters.AddWithValue("@userPassword", user.UserPassword);
            return cmd;
        }

        //--------------------------------------------------------------------------------------------------
        //                            R E A D - M Y  R E S E R V A T I O N   L I S T   
        //---------------------------------------------------------------------------------------------------
        public List<Reservation> getMyReservationsList(int userId)
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

            cmd = getMyReservationsListSP("spGetUserReservationList", con, userId);
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
        private SqlCommand getMyReservationsListSP(String spName, SqlConnection con, int userId)
        {
            SqlCommand cmd = new SqlCommand();// create the command object-
            cmd.Connection = con;// assign the connection to the command object
            cmd.CommandText = spName;// can be Select, Insert, Update, Delete 
            cmd.CommandTimeout = 10;// Time to wait for the execution' The default is 30 seconds
            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be stored procedure
            cmd.Parameters.AddWithValue("@userId", userId);
            return cmd;
        }


    }
}