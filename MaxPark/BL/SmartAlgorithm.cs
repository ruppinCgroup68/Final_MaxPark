using Microsoft.AspNetCore.DataProtection.KeyManagement;
using projMaxPark.DAL;
using System;
using System.Collections.Generic;
using System.Security.Cryptography;

namespace projMaxPark.BL
{
    public class SmartAlgorithm
    {

        public Object GetDailyAlgorithm()
        {
            DBservicesSmartAlgorithm dbsRes = new DBservicesSmartAlgorithm();
            List<Reservation> reservationsList = new List<Reservation>();
            reservationsList = dbsRes.getDailyReservations();

            DBservicesSmartAlgorithm dbsMarks = new DBservicesSmartAlgorithm();
            List<Mark> markList = new List<Mark>();
            markList = dbsMarks.getParkingMarks();


            //insert isAvailable = true
            foreach (Mark mark in markList)
            {
                mark.IsAvailable = true;
            }
            foreach (Reservation reservation in reservationsList)
            {
                reservation.MarkId = 0;
            }

            reservationsList = BubbleSort(reservationsList);
            reservationsList = GroupReservations(reservationsList);
            AssignParkingSlots(ref reservationsList, ref markList);

  

            foreach (Reservation res in reservationsList)
            {
                DBservicesSmartAlgorithm dbsStatus = new DBservicesSmartAlgorithm();
                DBservicesSmartAlgorithm dbsMarkId = new DBservicesSmartAlgorithm();
                dbsStatus.UpdateReservationStatus(res);

                if (res.Reservation_Status == "אישור")
                {
                    dbsMarkId.UpdateReservationMarkId(res);
                }

            }

            foreach (Mark mark in markList)
            {
                DBservicesSmartAlgorithm dbsMark = new DBservicesSmartAlgorithm();
                dbsMark.UpdateIsAvailableMark(mark);
            }

            DBservicesSmartAlgorithm dbsObj = new DBservicesSmartAlgorithm();
            return dbsObj.getUpdatedReservations();

        }

        //bubble sort - by early end
        private List<Reservation> BubbleSort(List<Reservation> list)
        {
            int n = list.Count;
            for (int i = 0; i < n - 1; i++)
            {
                for (int j = 0; j < n - i - 1; j++)
                {
                    // Parse the end times of the current and next reservations
                    TimeSpan endTime1 = TimeSpan.Parse(list[j].Reservation_ETime);
                    TimeSpan endTime2 = TimeSpan.Parse(list[j + 1].Reservation_ETime);

                    // Parse the start times of the current and next reservations
                    TimeSpan startTime1 = TimeSpan.Parse(list[j].Reservation_STime);
                    TimeSpan startTime2 = TimeSpan.Parse(list[j + 1].Reservation_STime);

                    // Compare end times first
                    if (endTime1 > endTime2 || (endTime1 == endTime2 && startTime1 < startTime2))
                    {
                        // Swap the reservations if the first end time is greater
                        // or if end times are equal and first start time is later
                        Reservation temp = list[j];
                        list[j] = list[j + 1];
                        list[j + 1] = temp;
                    }
                }
            }
            return list;
        }

        private List<Reservation> GroupReservations(List<Reservation> reservations)
        {
            List<Reservation> groupedReservations = new List<Reservation>();//החזרת רשימה חדשה
            HashSet<int> addedReservationIds = new HashSet<int>();//שמירת מס ייחודי של הזמנות שנוספו כבר

            int count = reservations.Count;//שמירת מס ייחודי של הזמנות שנוספו כבר

            for (int i = 0; i < count; i++)
            {
                Reservation current = reservations[i];
                if (addedReservationIds.Contains(current.ReservationId))
                    continue; // אם כבר טופלה ההזמנה הזו, דלג עליה

                List<Reservation> currentCombination = new List<Reservation>();
                currentCombination.Add(current);
                addedReservationIds.Add(current.ReservationId);

                TimeSpan endTime = TimeSpan.Parse(current.Reservation_ETime);

                for (int j = i + 1; j < count; j++)
                {
                    Reservation next = reservations[j];
                    TimeSpan startTimeNext = TimeSpan.Parse(next.Reservation_STime);
                    TimeSpan endTimeNext = TimeSpan.Parse(next.Reservation_ETime);
                    if (startTimeNext >= endTime && !addedReservationIds.Contains(next.ReservationId))
                    {
                        currentCombination.Add(next);
                        addedReservationIds.Add(next.ReservationId);
                        endTime = endTimeNext;
                    }
                }
                groupedReservations.AddRange(currentCombination); // הוספת כל הקבוצה לרשימת ההזמנות הכוללת
            }
            return groupedReservations;
        }


        private void AssignParkingSlots(ref List<Reservation> sortedGroupedReservations, ref List<Mark> marks)
        {
            // Mapping of markId to list of reservations and tracking blocked marks
            Dictionary<string, List<Reservation>> markAvailability = new Dictionary<string, List<Reservation>>();
            Dictionary<string, string> blockMarks = new Dictionary<string, string>(); // Maps blocked markId to blocker markId

            foreach (Mark mark in marks)
            {
                if (mark.IsAvailable)
                {
                    markAvailability.Add(mark.MarkName, new List<Reservation>());
                    if (mark.MarkName_Block != "-")
                    {
                        // Find the blocker markId
                        string blockerMarkName = marks.FirstOrDefault(m => m.MarkName == mark.MarkName_Block)?.MarkName ?? "";
                        if (blockerMarkName != "")
                        {
                            blockMarks.Add( blockerMarkName, mark.MarkName);
                        }
                    }
                }
            }
         
            foreach (Reservation reservation in sortedGroupedReservations)
            {
                bool assigned = false;
                foreach (string markName in markAvailability.Keys)
                {
                    // בדיקה 1: אם המפתח במילון החסימות
                    if (blockMarks.ContainsKey(markName))
                    {
                        string blockerMark = blockMarks[markName];
                        List<Reservation> blockerReservations = markAvailability[blockerMark];

                        // נבדוק אם יש חפיפת זמנים בין ההזמנות של החנייה החוסמת לבין ההזמנה הנוכחית
                        if (blockerReservations.All(r => TimesOverlap(r, reservation)))
                        {
                            if (CanAssign(markAvailability[markName], reservation))
                            {
                                markAvailability[markName].Add(reservation);
                                reservation.MarkId = marks.FirstOrDefault(m => m.MarkName == markName)?.MarkId ?? 0;
                                reservation.Reservation_Status = "אישור";
                                assigned = true;
                                break;
                            }
                        }
                    }

                    // אם אין חפיפת זמנים, נמשיך לבדוק אם ניתן לשבץ את ההזמנה
                    else if(CanAssign(markAvailability[markName], reservation))
                    {
                        markAvailability[markName].Add(reservation);
                        reservation.MarkId = marks.FirstOrDefault(m => m.MarkName == markName)?.MarkId ?? 0;
                        reservation.Reservation_Status = "אישור";
                        assigned = true;
                        break;
                    }
                }

                if (!assigned)
                {
                    reservation.Reservation_Status = "דחייה";
                }
            }

            sortedGroupedReservations = swapSlot(markAvailability);
            return;
        }

        

        private bool TimesOverlap(Reservation r1, Reservation r2)
        {
            TimeSpan start1 = TimeSpan.Parse(r1.Reservation_STime);
            TimeSpan end1 = TimeSpan.Parse(r1.Reservation_ETime);
            TimeSpan start2 = TimeSpan.Parse(r2.Reservation_STime);
            TimeSpan end2 = TimeSpan.Parse(r2.Reservation_ETime);

            return ((start1 >= start2 && end1 <= end2) || end1 <= start2 || start1 >= end2);
        }

        private bool CanAssign(List<Reservation> currentReservations, Reservation newReservation)
        {
            TimeSpan newStart = TimeSpan.Parse(newReservation.Reservation_STime);
            TimeSpan newEnd = TimeSpan.Parse(newReservation.Reservation_ETime);

            foreach (Reservation existing in currentReservations)
            {
                TimeSpan existingStart = TimeSpan.Parse(existing.Reservation_STime);
                TimeSpan existingEnd = TimeSpan.Parse(existing.Reservation_ETime);
                // בדיקת חפיפת זמנים
                if (!(existingEnd <= newStart || existingStart >= newEnd))
                {
                    return false; // חפיפת זמנים מתרחשת, לא ניתן לשבץ את ההזמנה החדשה בחנייה זו
                }
            }
            return true; // אין חפיפות, ניתן לשבץ את ההזמנה בחנייה זו
        }

        private List<Reservation> swapSlot(Dictionary<string, List<Reservation>> combinations)
        {
            List<Reservation> updatedlist = new List<Reservation>();
            foreach (string markNames in combinations.Keys)
            {
                string previousKey = markNames.Substring(0, markNames.Length - 1);

                if (markNames.Contains("b") && combinations[markNames].Count > 0)
                {
                    List<Reservation> blockList = combinations[markNames];
                    combinations[markNames] = combinations[previousKey];
                    combinations[previousKey] = blockList;

                    int markId1 = combinations[previousKey][0].MarkId;
                    int markId2 = combinations[markNames][0].MarkId;

                    foreach (Reservation reservation in combinations[markNames])
                    {
                        reservation.MarkId = markId1;
                    }

                    foreach (Reservation reservation in combinations[previousKey])
                    {
                        reservation.MarkId = markId2;
                    }

                    for (int i = 0; i < combinations[markNames].Count; i++)
                    {
                        Reservation reservation = combinations[markNames][i];
                        if (CanAssign(combinations[previousKey], reservation))
                        {
                            reservation.MarkId = markId2;
                            combinations[previousKey].Add(reservation);
                            combinations[markNames].RemoveAt(i);
                            i--; // Decrement i since we removed an item at index i
                        }
                    }

                }
            }

            foreach(string combKey in combinations.Keys)
            {
                updatedlist.AddRange(combinations[combKey]);
            }
            return updatedlist;
        }



    }
}
