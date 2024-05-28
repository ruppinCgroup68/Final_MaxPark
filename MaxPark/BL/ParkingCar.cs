namespace projMaxPark.BL
{
    public class ParkingCar
    {
        int parkId;
        string parkName;
        string parkAddress;
        string parkPitures;

        public ParkingCar(int parkId, string parkName, string parkAddress, string parkPitures)
        {
            ParkId = parkId;
            ParkName = parkName;
            ParkAddress = parkAddress;
            ParkPitures = parkPitures;
        }

        public ParkingCar() { }

        public int ParkId { get => parkId; set => parkId = value; }
        public string ParkName { get => parkName; set => parkName = value; }
        public string ParkAddress { get => parkAddress; set => parkAddress = value; }
        public string ParkPitures { get => parkPitures; set => parkPitures = value; }

    }
}
