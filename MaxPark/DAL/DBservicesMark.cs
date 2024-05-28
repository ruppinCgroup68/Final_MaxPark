using projMaxPark.BL;
using System.Data.SqlClient;
using System.Data;
using System.Text.Json;
using System.Dynamic;

namespace projMaxPark.DAL
{
    public class DBservicesMark
    {
        /// <summary>
        /// DBServices is a class created by me to provides some DataBase Services
        /// </summary>
        public DBservicesMark()
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
        //                            R E A D - M A R K S 
        //---------------------------------------------------------------------------------------------------
        public List<Mark> readMarkList()
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

            cmd = ReadMarkListSP("spReadMarkList", con);
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
        private SqlCommand ReadMarkListSP(String spName, SqlConnection con)
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