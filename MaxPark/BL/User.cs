using MaxPark.DAL;

namespace MaxPark.BL
{
    public class User
    {
        int userId;
        string userEmail;
        string userPassword;
        string userFirstName;
        string userLastName;
        string userCarNum;
        string userPhone;
        string userImagePath;
        bool isAdmin;
        bool isParkingManager;
        bool isActive;

        public User() { } 

        public User(int userId, string userEmail, string userPassword, string userFirstName, string userLastName, string userCarNum, string userPhone, string userImagePath, bool isAdmin, bool isParkingManager, bool isActive)
        {
            UserId = userId;
            UserEmail = userEmail;
            UserPassword = userPassword;
            UserFirstName = userFirstName;
            UserLastName = userLastName;
            UserCarNum = userCarNum;
            UserPhone = userPhone;
            UserImagePath = userImagePath;
            IsAdmin = isAdmin;
            IsParkingManager = isParkingManager;
            IsActive = isActive;
        }

        public int UserId { get => userId; set => userId = value; }
        public string UserEmail { get => userEmail; set => userEmail = value; }
        public string UserPassword { get => userPassword; set => userPassword = value; }
        public string UserFirstName { get => userFirstName; set => userFirstName = value; }
        public string UserLastName { get => userLastName; set => userLastName = value; }
        public string UserCarNum { get => userCarNum; set => userCarNum = value; }
        public string UserPhone { get => userPhone; set => userPhone = value; }
        public string UserImagePath { get => userImagePath; set => userImagePath = value; }
        public bool IsAdmin { get => isAdmin; set => isAdmin = value; }
        public bool IsParkingManager { get => isParkingManager; set => isParkingManager = value; }
        public bool IsActive { get => isActive; set => isActive = value; }

        public Object Login()
        {
            DBservicesUser dbs = new DBservicesUser();
            return dbs.Login(this);
        }

        public List<Reservation> getReservationList(int userId)
        {
            DBservicesUser dbs = new DBservicesUser();
            return dbs.getMyReservationsList(userId);
        }

        public Object updateDetails()
        {
            DBservicesUser dbService = new DBservicesUser();
            return dbService.updateDetails(this);
        }

        public int updatePassword()
        {
            DBservicesUser dbs = new DBservicesUser();
            return dbs.updatePassword(this);
        }

        public Object GetUserByCarNumber(string carNumber)
        {
            DBservicesUser dbsUser = new DBservicesUser();
            return dbsUser.getUserByCarNumber(carNumber);
        }
    }
}
