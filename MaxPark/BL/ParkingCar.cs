namespace MaxPark.BL
{
    public class ParkingCar
    {
        int parkId;
        string parkName;
        string parkAddress;

        public ParkingCar() { }

        public ParkingCar(int parkId, string parkName, string parkAddress)
        {
            ParkId = parkId;
            ParkName = parkName;
            ParkAddress = parkAddress;
        }

        public int ParkId { get => parkId; set => parkId = value; }
        public string ParkName { get => parkName; set => parkName = value; }
        public string ParkAddress { get => parkAddress; set => parkAddress = value; }
    }
}
