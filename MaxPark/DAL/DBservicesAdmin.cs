using MaxPark.BL;
using System.Data.SqlClient;
using System.Data;

namespace MaxPark.DAL
{
    public class DBservicesAdmin
    {
        /// <summary>
        /// DBServices is a class created by me to provides some DataBase Services
        /// </summary>
        public DBservicesAdmin()
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
        //                            R E A D - A L L  U S E R S 
        //---------------------------------------------------------------------------------------------------
        public List<User> getAllUsers()
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
            List<User> users = new List<User>();
            cmd = ReadAllUsers(con, "spGetAllUsers");
            SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
            while (dataReader.Read())
            {
                User u = new User();
                u.UserId = Convert.ToInt32(dataReader["userId"]);
                u.UserEmail = dataReader["userEmail"].ToString();
                u.UserFirstName = dataReader["userFirstName"].ToString();
                u.UserLastName = dataReader["userLastName"].ToString();
                u.UserCarNum = dataReader["userCarNum"].ToString();
                u.UserPhone = dataReader["userPhone"].ToString();
                u.UserImagePath = dataReader["userImagePath"].ToString();
                u.IsAdmin = Convert.ToBoolean(dataReader["isAdmin"]);
                u.IsParkingManager = Convert.ToBoolean(dataReader["isParkingManager"]);
                u.IsActive = Convert.ToBoolean(dataReader["isActive"]);

                users.Add(u);
            }
            if (con != null)
            {
                // close the db connection
                con.Close();
            }

            return users;
        }

        //---------------------------------------------------------------------------------------------------
        SqlCommand ReadAllUsers(SqlConnection con, string spName)
        {
            SqlCommand cmd = new SqlCommand();// create the command object
            cmd.Connection = con;// assign the connection to the command object
            cmd.CommandText = spName;// can be Select, Insert, Update, Delete 
            cmd.CommandTimeout = 10;// Time to wait for the execution' The default is 30 seconds
            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text
            return cmd;
        }

        //--------------------------------------------------------------------------------------------------
        //                            I N S E R T  - U S E R 
        //---------------------------------------------------------------------------------------------------
        public int InsertNewUser(User user)
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

            cmd = insertNewUserSP("spInsertUserByAdmin", con, user);// create the command

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
        private SqlCommand insertNewUserSP(String spName, SqlConnection con, User user)
        {
            SqlCommand cmd = new SqlCommand(); // create the command object
            cmd.Connection = con; // assign the connection to the command object
            cmd.CommandText = spName;// can be Select, Insert, Update, Delete 
            cmd.CommandTimeout = 10; // Time to wait for the execution' The default is 30 seconds
            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be stored procedure
            cmd.Parameters.AddWithValue("@userEmail", user.UserEmail);
            cmd.Parameters.AddWithValue("@userPassword", user.UserPassword);
            cmd.Parameters.AddWithValue("@userFirstName", user.UserFirstName);
            cmd.Parameters.AddWithValue("@userLastName", user.UserLastName);
            cmd.Parameters.AddWithValue("@userCarNum", user.UserCarNum);
            cmd.Parameters.AddWithValue("@userPhone", user.UserPhone);
            return cmd;
        }

        //--------------------------------------------------------------------------------------------------
        //                            Update User isActive 
        //-------------------------------------------------------------------------------------------------- 
        public int updateIsActive(int userId, bool isActive)
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

            cmd = CreateCommandWithStoredProcedure("spUpdateUserIsActive", con, userId, isActive); // create the command

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

        //---------------------------------------------------------------------------------
        private SqlCommand CreateCommandWithStoredProcedure(String spName, SqlConnection con, int userId, bool isActive)
        {
            SqlCommand cmd = new SqlCommand(); // create the command object
            cmd.Connection = con; // assign the connection to the command object
            cmd.CommandText = spName; // can be Select, Insert, Update, Delete 
            cmd.CommandTimeout = 10; // Time to wait for the execution' The default is 30 seconds
            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text
            cmd.Parameters.AddWithValue("@userId", userId);
            cmd.Parameters.AddWithValue("@isActive", isActive);
            return cmd;
        }

        //--------------------------------------------------------------------------------------------------
        //                            Insert - Mark
        //---------------------------------------------------------------------------------------------------
        public int InsertMark(string mark, string blockMark)
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

            cmd = insertNewMarkSP("spInsertMarkByAdmin", con, mark, blockMark);// create the command

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
        private SqlCommand insertNewMarkSP(String spName, SqlConnection con, string mark, string blockMark)
        {
            SqlCommand cmd = new SqlCommand(); // create the command object
            cmd.Connection = con; // assign the connection to the command object
            cmd.CommandText = spName;// can be Select, Insert, Update, Delete 
            cmd.CommandTimeout = 10; // Time to wait for the execution' The default is 30 seconds
            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be stored procedure
            cmd.Parameters.AddWithValue("@markName", mark);
            cmd.Parameters.AddWithValue("@markName_Block", blockMark);
            return cmd;
        }

        //--------------------------------------------------------------------------------------------------
        //              D E L E T E  - C O L U M N   M A R K S   I N  R E S E R V A T I O N 
        //---------------------------------------------------------------------------------------------------
        public int deleteColResMarks()
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

            cmd = deleteColMarkIdSP("spDeleteColMarkIdInReservations", con);//create the command

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
                    // close the db connection
                    con.Close();
                }
            }

        }
        //--------------------------------------------------------------------------------------------------
        private SqlCommand deleteColMarkIdSP(String spName, SqlConnection con)
        {
            SqlCommand cmd = new SqlCommand();// create the command object
            cmd.Connection = con;// assign the connection to the command object
            cmd.CommandText = spName;// can be Select, Insert, Update, Delete 
            cmd.CommandTimeout = 10;// Time to wait for the execution' The default is 30 seconds
            cmd.CommandType = System.Data.CommandType.StoredProcedure;// the type of the command, can also be text
            return cmd;
        }

        //--------------------------------------------------------------------------------------------------
        //                            D E L E T E  - M A R K S
        //---------------------------------------------------------------------------------------------------
        public int deleteAllMarks()
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
            cmd = deleteParkingMarksSP("spDeleteallMarksByAdmin", con);// create the command

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
        private SqlCommand deleteParkingMarksSP(String spName, SqlConnection con)
        {
            SqlCommand cmd = new SqlCommand();// create the command object
            cmd.Connection = con;// assign the connection to the command object
            cmd.CommandText = spName;// can be Select, Insert, Update, Delete 
            cmd.CommandTimeout = 10;// Time to wait for the execution' The default is 30 seconds
            cmd.CommandType = System.Data.CommandType.StoredProcedure;// the type of the command, can also be text
            return cmd;
        }
    }
}
