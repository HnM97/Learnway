import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Calendar from "react-calendar";
import axios from "axios";
import StudyScripts from "./StudyScripts";
import moment from "moment/moment";
import "react-calendar/dist/Calendar.css";
import "../../ui/mypage.css";

function MyCalendar(props) {
    const store = useSelector((state) => state.UserStore);

    // value : 선택된 일자
    const [value, setValue] = useState(new Date());

    // viewValue : 클릭으로 인해 바뀌는 캘린더view정보
    const [viewValue, setViewValue] = useState({});

    // mark : 해당월에 기록되어있는 일별 학습목록 {기록이 남은 일자: 학습량}
    const [mark, setMark] = useState({});

    // 해당 년월 학습일자(학습량) 조회
    function getMonthlyLog({ year, month }) {
        axios
            .get(
                "api/study/month",
                { params: {user_email: store["userEmail"], study_month: `${year}-${month}`} })
            .then(function (res) {
                const data = res.data.monthCountList;
                console.log("getMonthlyLog", year, month);
                const logDay = {};
                for (let i = 1; i < data.length; i++) {
                    if (data[i].count !== 0) {
                        logDay[data[i].monthDate] = data[i].count;
                        // {기록이 남은 일자: 학습량}으로 재가공
                    }
                }
                console.log(logDay)
                setMark(logDay);
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    useEffect(() => {
        if (viewValue.activeStartDate) {
            var viewYearDate = {
                year: viewValue.activeStartDate.getYear() + 1900,
                month: viewValue.activeStartDate.getMonth() + 1,
            };
        } else {
            var viewYearDate = {
                year: value.getYear() + 1900,
                month: value.getMonth() + 1,
            };
        }
        console.log(viewYearDate)
        getMonthlyLog(viewYearDate);
    }, [viewValue]);

    return (
        <div className="wrapper-row">
            <div>
                <div className="subtitle">Calendar</div>
                <Calendar
                    style={{ height: 500 }}
                    className="white-card"
                    onChange={setValue}
                    onActiveStartDateChange={setViewValue} // 유저의 action으로 인해 바뀌는 캘린더view정보 -> { action, activeStartDate, value, view }
                    value={value} // 선택된 일자
                    showNeighboringMonth={false}
                    tileClassName={({ date, view }) => {
                        // 해당 달의 일자에만 표시
                        const day = moment(date).format("YYYY-MM-DD")
                        if (day in mark) {
                            if (mark[day] < 3) {
                                return "highlight-low";
                            } else if (mark[day] >= 3) {
                                return "highlight-high";
                            }
                        }
                    }}
                />
            </div>
            <StudyScripts selectedDate={value} />
        </div>
    );
}

function Study() {
    return (
        <MyCalendar />
    );
}

export default Study;
