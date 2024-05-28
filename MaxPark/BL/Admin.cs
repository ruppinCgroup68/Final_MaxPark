using projMaxPark.DAL;
using System.Text.Json;

namespace projMaxPark.BL
{
    public class Admin
    {

        public List<User> getAllUsers()
        {
            DBservicesAdmin dbs = new DBservicesAdmin();
            return dbs.getAllUsers();
        }

        public int insertUser(User user)
        {
            DBservicesAdmin dbs = new DBservicesAdmin();
            return dbs.InsertNewUser(user);
        }

       public int insertMark(string mark, string blockMark)
        {
            DBservicesAdmin dbs = new DBservicesAdmin();
            return dbs.InsertMark(mark, blockMark);
        }

        public int deleteParkingMarks()
        {
            DBservicesAdmin dbsDeleteResCol= new DBservicesAdmin();
            dbsDeleteResCol.deleteColResMarks();

            DBservicesAdmin dbsDeleteMarks = new DBservicesAdmin();
           return  dbsDeleteMarks.deleteAllMarks();
        }
    }
}
