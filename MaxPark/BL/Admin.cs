using MaxPark.DAL;

namespace MaxPark.BL
{
    public class Admin
    {
        // Get users
        public List<User> getAllUsers()
        {
            DBservicesAdmin dbs = new DBservicesAdmin();
            return dbs.getAllUsers();
        }

        // Insert user
        public int insertUser(User user)
        {
            DBservicesAdmin dbs = new DBservicesAdmin();
            return dbs.InsertNewUser(user);
        }

        // Update users isActive status
        public int updateIsActive(int id, bool isActive)
        {
            DBservicesAdmin dbs = new DBservicesAdmin();
            return dbs.updateIsActive(id, isActive);

        }

        // Insert mark
        public int insertMark(string mark, string blockMark)
        {
            DBservicesAdmin dbs = new DBservicesAdmin();
            return dbs.InsertMark(mark, blockMark);
        }

        // delete mark
        //public int Delete(int id)
        //{

        //    DBservicesAdmin dbs = new DBservicesAdmin();
        //    return dbs.deleteMark(id);

        //}

        //algorithm-delete marks from tblReservations & tblMark
        public int deleteParkingMarks()
        {
            DBservicesAdmin dbsDeleteResCol = new DBservicesAdmin();
            dbsDeleteResCol.deleteColResMarks();

            DBservicesAdmin dbsDeleteMarks = new DBservicesAdmin();
            return dbsDeleteMarks.deleteAllMarks();
        }
    }
}
