using projMaxPark.DAL;

namespace projMaxPark.BL
{
    public class User
    {
        int userId;
        string userEmail;
        string userPassword;
        string userName;
        string userLastName;
        string userCarNum;
        string userPhone;
        bool isAdmin;
        bool isManager;

        public User(int userId, string userEmail, string userPassword, string userName, string userLastName, string userCarNum, string userPhone, bool isAdmin, bool isManager)
        {
            UserId = userId;
            UserEmail = userEmail;
            UserPassword = userPassword;
            UserName = userName;
            UserLastName = userLastName;
            UserCarNum = userCarNum;
            UserPhone = userPhone;
            IsAdmin = isAdmin;
            IsManager = isManager;
        }

        public User() { }

        public int UserId { get => userId; set => userId = value; }
        public string UserEmail { get => userEmail; set => userEmail = value; }
        public string UserPassword { get => userPassword; set => userPassword = value; }
        public string UserName { get => userName; set => userName = value; }
        public string UserLastName { get => userLastName; set => userLastName = value; }
        public string UserCarNum { get => userCarNum; set => userCarNum = value; }
        public string UserPhone { get => userPhone; set => userPhone = value; }
        public bool IsAdmin { get => isAdmin; set => isAdmin = value; }
        public bool IsManager { get => isManager; set => isManager = value; }

        public int Login()
        {
            DBservicesUser login = new DBservicesUser();
            return login.UserLogin(this);
        }

        public List<Reservation> getReservationList(int userId)
        {
            DBservicesUser dbs = new DBservicesUser();
            return dbs.getMyReservationsList(userId);
        }


    }
}
