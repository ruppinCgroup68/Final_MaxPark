using projMaxPark.DAL;

namespace projMaxPark.BL
{
    public class Mark
    {
            int markId;
            int parkId;
            string markName;
            string markName_Block;
            bool isAvailable;

        public Mark(int markId, int parkId, string markName, string markName_Block, bool isAvailable)
        {
            MarkId = markId;
            ParkId = parkId;
            MarkName = markName;
            MarkName_Block = markName_Block;
            IsAvailable = isAvailable;
        }

        public Mark() { }

        public int MarkId { get => markId; set => markId = value; }
        public int ParkId { get => parkId; set => parkId = value; }
        public string MarkName { get => markName; set => markName = value; }
        public string MarkName_Block { get => markName_Block; set => markName_Block = value; }
        public bool IsAvailable { get => isAvailable; set => isAvailable = value; }


        public List<Mark> readMarkList()
        {
            DBservicesMark dbs = new DBservicesMark();
            return dbs.readMarkList();
        }
    }
}
