import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import Dots from 'react-activity/dist/Dots';
import 'react-activity/dist/Dots.css';
import FlatList from 'flatlist-react';
import CachedIcon from '@mui/icons-material/Cached';
import IconButton from '@mui/material/IconButton';
import '../App.css';

class Timetable extends React.Component {
    constructor(props) {
        super(props);

        this.times = this.times.bind(this);
        this.determineColour = this.determineColour.bind(this);
        this.addSeparator = this.addSeparator.bind(this);

        this.state = {
            responseStatus: false,
            isLoading: true,
        }
    }

    async getDailyTimetable() {
        try {
            this.setState({ isLoading: true });
            window.localStorage.removeItem('timetablePersist');
            let uuid = uuidv4();
            const response = await fetch('https://resentral-server.herokuapp.com/api/daily_timetable/' + uuid, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: new TextEncoder().encode(
                    JSON.stringify({
                        username: window.localStorage.getItem('username'),
                        password: window.localStorage.getItem('password')
                    })
                ),
            })
            await fetch('https://resentral-server.herokuapp.com/api/daily_timetable/' + uuid, {
                method: 'DELETE',
            });
            const timetable = await response.json();
            this.setWithExpiry('timetablePersist', timetable.response);
            new Promise(resolve => setTimeout(resolve, 5000));
        } catch (err) {
            console.error(err);
        } finally {
            this.setState({ isLoading: false })
        }
    }

    setWithExpiry(key, value) {
        const now = new Date().getDate();
        const item = {
            value: value,
            expiry: now,
        };
        window.localStorage.setItem(key, JSON.stringify(item));
    }

    getWithExpiry(key) {
        const itemStr = window.localStorage.getItem(key);
        if (!itemStr) {
            return null;
        };
        const item = JSON.parse(itemStr);
        const now = new Date().getDate();
        if (now != item.expiry) {
            localStorage.removeItem(key);
            return null;
        }
        return item.value;
    }

    times(period) {
        const day = new Date().getDay();
        if (day === 0 || day === 1 || day === 4 || day === 6) {
            switch(period) {
                case "Before":
                    return "7:30 ~ 8:30";
                case '1':
                    return "8:40 ~ 9:50";
                case '2':
                    return "9:50 ~ 10:50";
                case '3':
                    return "11:10 ~ 12:10";
                case '4':
                    return "12:10 ~ 13:10";
                case '5':
                    return "13:55 ~ 14:55";
                default:
                    return "N/A";
            }
        } else if (day === 2) {
            switch(period) {
                case "Before":
                    return "7:30 ~ 8:30";
                case '1':
                    return "8:40 ~ 9:35";
                case '2':
                    return "9:35 ~ 10:30";
                case '3':
                    return "11:20 ~ 12:15";
                case '4':
                    return "12:15 ~ 13:10";
                case '5':
                    return "13:55 ~ 14:55";
                default:
                    return "N/A";
            }
        } else if (day === 3) {
            switch(period) {
                case "Before":
                    return "7:30 ~ 8:30";
                case '1':
                    return "8:40 ~ 9:50";
                case '2':
                    return "9:50 ~ 10:50";
                case '3':
                    return "11:05 ~ 12:05";
                case '4':
                    return "12:55 ~ 13:55";
                case '5':
                    return "13:55 ~ 14:55";
                default:
                    return "N/A";
            }
        } else if (day === 5) {
            switch(period) {
                case "Before":
                    return "7:30 ~ 8:30";
                case '1':
                    return "8:40 ~ 9:45";
                case '2':
                    return "9:45 ~ 10:45";
                case '3':
                    return "11:15 ~ 12:15";
                case '4':
                    return "12:15 ~ 13:15";
                case '5':
                    return "13:55 ~ 14:55";
                default:
                    return "N/A";
            }
        }
    }

    determineColour(subject) {
        switch(subject) {
            case "Mathematics":
            case "Maths":
                return "rgb(191, 97, 106)";   // Red
            case "Sport":
                return "rgb(208, 135, 112)"   // Orange
            case "English":
                return "rgb(235, 203, 139)";  // Yellow
            case "Japanese":
                return "rgb(163, 190, 140)";  // Green
            case "Engineering":
            case "Industrial":
            case "Multimedia":
            case "Timber":
                return "rgb(94, 129, 172)";   // Blue
            case "Chemistry":
            case "Biology":
            case "Physics":
            case "Science":
                return "rgb(136, 192, 208)";  // Light Blue
            case "HSIE":
            case "Visual":
                return "rgb(180, 142, 173)";  // Purple
            default:
                return "#3B4252";
        }
    }

    addSeparator(period) {
        if (period === '2') {
            return(
                <div className="separator">
                    <div className="separator-bar">―――――</div>
                    <div className="separator-text">Recess</div>
                    <div className="separator-bar">―――――</div>
                </div>
            )
        } else if (period === '4') {
            return(
                <div className="separator">
                    <div className="separator-bar">―――――</div>
                    <div className="separator-text">Lunch</div>
                    <div className="separator-bar">―――――</div>
                </div>
            )
        } else {
            return <div></div>
        }
    }

    renderContent(data) {
        let content = [];
        let period_counter = 1;
        for (let i = 0; i < data.length; i++) {
            const free_period = [
                {
                    "period": period_counter.toString(),
                    "subject": "N/A",
                    "class": "Free Period",
                    "room": "N/A",
                    "teacher": "N/A"
                }
            ]
            if (data[i].period != "Before") {
                if (data[i].period != period_counter) {
                    data.splice(i, 0, ...free_period);
                }
                period_counter += 1;
            }
            content.push(
                <div>
                    <div className="timetable-card-container">
                        <div className="timetable-card">
                            <div className="side-block" style={{ background: this.determineColour(data[i].subject) }}></div>
                            <div className="timetable-text">
                                <div className="timetable-class">{data[i].class}</div>
                                <div className="timetable-room">{data[i].room}</div>
                                <div className="timetable-teacher">{data[i].teacher}</div>
                                <div className="timetable-times">{this.times(data[i].period)}</div>
                            </div>
                        </div>
                        <div className="period">
                            <div>{data[i].period === "Before" ? "B" : data[i].period}</div>
                        </div>
                    </div>
                    {this.addSeparator(data[i].period)}
                </div>
            );
        }
        return content;
    }

    componentDidMount() {
        if (this.getWithExpiry('timetablePersist') != null) {
            this.setState({ isLoading: false })
        } else {
            this.getDailyTimetable();
        }
    }

    render() {
        const { isLoading } = this.state;
        const data = this.getWithExpiry('timetablePersist');
        const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

        return(
            <div className="timetable-container" style={{width: isLoading ? 'auto' : '100%'}}>
                <div className="header">
                    <div className="timetable-title">Today's Timetable</div>
                    <IconButton
                        sx={{
                            color: '#ECEFF4',
                            position: 'absolute',
                            right: '33px',
                            top: '33px',
                        }}
                        size="large"
                        onClick={() => { this.getDailyTimetable() }}
                        disableRipple
                    >
                        <CachedIcon fontSize="25px"/>
                    </IconButton>
                    <div className="dayoftheweek">{weekday[new Date().getDay()]}</div>
                </div>
                {isLoading ? <Dots /> : (
                    <FlatList 
                        list={data}
                        renderItem={() => (
                            <div>
                            {this.renderContent(data)}
                            </div>
                        )}
                        renderWhenEmpty={() => <div>Error getting timetable (Check your username and password)</div>}
                        limit={1}
                    />
                )}
            </div>
        )
    }
}

export default Timetable;
