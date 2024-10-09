using MaxPark.BL;
using System.Data;
using System.Data.SqlClient;

namespace MaxPark.DAL
{
    public class DBservicesUser
    {
        private object dataReader;

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
        //                                   LogIn
        //--------------------------------------------------------------------------------------------------
        public Object Login(User user)
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
                SqlDataReader reader = cmd.ExecuteReader(); // execute the command

                while (reader.Read())
                {
                    Object userLogin = new
                    {
                        userId = Convert.ToInt32(reader["userId"]),
                        userEmail = reader["userEmail"].ToString(),
                        userFirstName = reader["userFirstName"].ToString(),
                        userLastName = reader["userLastName"].ToString(),
                        userCarNum = reader["userCarNum"].ToString(),
                        userPhone = reader["userPhone"].ToString(),
                        userImagePath = reader["userImagePath"].ToString(),
                        isAdmin = Convert.ToBoolean(reader["isAdmin"]),
                        isParkingManager = Convert.ToBoolean(reader["isParkingManager"]),
                        isActive = Convert.ToBoolean(reader["isActive"]),
                        notificationCode = reader["notificationCode"].ToString()
                    };

                    return userLogin;
                }
                return null;
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
            cmd.CommandTimeout = 30; // Time to wait for the execution' The default is 30 seconds
            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text
            cmd.Parameters.AddWithValue("@userEmail", user.UserEmail);
            cmd.Parameters.AddWithValue("@userPassword", user.UserPassword);
            return cmd;
        }

        //--------------------------------------------------------------------------------------------------
        //                            Read my Reservation List
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

        //--------------------------------------------------------------------------------------------------
        //                         update user details  
        //---------------------------------------------------------------------------------------------------
        public Object updateDetails(User user)
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

            cmd = updateUserDetailsSP("spUpdateUserDetails", con, user); // create the command
            try
            {
                SqlDataReader reader = cmd.ExecuteReader(); // execute the command

                while (reader.Read())
                {
                    Object updatedUser = new
                    {
                        userId = Convert.ToInt32(reader["userId"]),
                        userEmail = reader["userEmail"].ToString(),
                        userFirstName = reader["userFirstName"].ToString(),
                        userLastName = reader["userLastName"].ToString(),
                        userCarNum = reader["userCarNum"].ToString(),
                        userPhone = reader["userPhone"].ToString(),
                        userImagePath = reader["userImagePath"].ToString()
                    };

                    return updatedUser;
                }
                return null;
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

        private SqlCommand updateUserDetailsSP(String spName, SqlConnection con, User user)
        {
            SqlCommand cmd = new SqlCommand(); // create the command object
            cmd.Connection = con; // assign the connection to the command object
            cmd.CommandText = spName; // can be Select, Insert, Update, Delete 
            cmd.CommandTimeout = 10; // Time to wait for the execution' The default is 30 seconds
            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text
            cmd.Parameters.AddWithValue("@userId", user.UserId);
            cmd.Parameters.AddWithValue("@userEmail", user.UserEmail);
            cmd.Parameters.AddWithValue("@userFirstName", user.UserFirstName);
            cmd.Parameters.AddWithValue("@userLastName", user.UserLastName);
            cmd.Parameters.AddWithValue("@userCarNum", user.UserCarNum);
            cmd.Parameters.AddWithValue("@userPhone", user.UserPhone);
            cmd.Parameters.AddWithValue("@userImagePath", user.UserImagePath);
            return cmd;
        }


        // Notifications - user App - Aya
        public string GetUserNotificationCodeById(int userId)
        {

            SqlConnection con;
            SqlCommand cmd;
            int role = 0;

            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }

            cmd = getUserSP("spGetUserById", con, userId); // create the command

            try
            {
                SqlDataReader reader = cmd.ExecuteReader(); //execute the command


                while (reader.Read())
                {
                    return reader["notificationCode"].ToString();

                }

                return null;
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
        private SqlCommand getUserSP(String spName, SqlConnection con, int userId)
        {
            SqlCommand cmd = new SqlCommand(); // create the command object
            cmd.Connection = con;// assign the connection to the command object
            cmd.CommandText = spName;// can be Select, Insert, Update, Delete 
            cmd.CommandTimeout = 10; // Time to wait for the execution' The default is 30 seconds
            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text
            cmd.Parameters.AddWithValue("@userId", userId);
            return cmd;
        }

        //--------------------------------------------------------------------------------------------------
        //                             U P D A T E - U S E R S
        //--------------------------------------------------------------------------------------------------  
        public int updatePassword(User user)
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
            cmd = CreateCommandWithStoredProcedure("spUpdatePassword", con, user);// create the command
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
        private SqlCommand CreateCommandWithStoredProcedure(String spName, SqlConnection con, User user)
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
        //                                   Get Users Car Number
        //--------------------------------------------------------------------------------------------------
        public Object getUserByCarNumber(string carNumber)
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

            cmd = getCarNumSP("spGetUserByCarNumber", con, carNumber); // create the command

            try
            {
                SqlDataReader reader = cmd.ExecuteReader(); // execute the command

                while (reader.Read())
                {
                    Object blokingUser = new
                    {
                        userId = Convert.ToInt32(reader["userId"]),
                        userEmail = reader["userEmail"].ToString(),
                        userFirstName = reader["userFirstName"].ToString(),
                        userLastName = reader["userLastName"].ToString(),
                        userCarNum = reader["userCarNum"].ToString(),
                        userPhone = reader["userPhone"].ToString(),
                        userImagePath = reader["userImagePath"].ToString()
                    };

                    return blokingUser;
                }
                return null;

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
        private SqlCommand getCarNumSP(String spName, SqlConnection con, string carNumber)
        {
            SqlCommand cmd = new SqlCommand(); // create the command object
            cmd.Connection = con;// assign the connection to the command object
            cmd.CommandText = spName;// can be Select, Insert, Update, Delete 
            cmd.CommandTimeout = 30; // Time to wait for the execution' The default is 30 seconds
            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text
            cmd.Parameters.AddWithValue("@userCarNum", carNumber);
            return cmd;
        }
    }
}
