const path = require('path')
const fs = require('fs')

var train_category = {
    parse(data){
        data = data.toString()
        var rows = data.split(/\r?\n/)
        var starting = ""
        var obj = {}
        var currentItems = []
        for(var i = 0; i < rows.length; i++){
            var item = rows[i]
            if(item.includes(',')) currentItems.push(item)
            else {
                var innerobj = {}
                
                for(var j = 0; j < currentItems.length; j++){
                    var inneritem = currentItems[j].split(',')
                    innerobj[inneritem[0]] = inneritem[1]
                }
    
                obj[starting] = innerobj
    
                starting = item
                currentItems = []
            }
        }

        return obj
    },
    parseIntoArray(data){
        data = data.toString()
        var rows = data.split(/\r?\n/)
        var starting = ""
        var arr = []
        var currentItems = []
        for(var i = 0; i < rows.length; i++){
            var item = rows[i]
            if(item.includes(',')) currentItems.push(item)
            else {
                
                for(var j = 0; j < currentItems.length; j++){
                    var inneritem = currentItems[j].split(',')
                    arr.push({
                        code: inneritem[0],
                        description: inneritem[1],
                        type: starting
                    })
                }
    
                starting = item
                currentItems = []
            }
        }
        return arr
    }
}

train_category.parsed = train_category.parse(fs.readFileSync(path.join(__dirname, "./trainCategory.txt")).toString())
train_category.parsedIntoArray = train_category.parseIntoArray(fs.readFileSync(path.join(__dirname, "./trainCategory.txt")).toString())
train_category.fromCode = code => {
    return train_category.parsedIntoArray.find(a => a.code === code)
}

var power_type = {
    object: {
        D: "Diesel",
        DEM: "Diesel Electric Multiple Unit",
        DMU: "Diesel Mecahnical Multiple Unit",
        E: "Electric",
        ED: "Electro-Diesel",
        EML: "EMU plus Diesel, Electric or Electro-Diesel locomotive",
        EMU: "Electric Multiple Unit",
        HST: "High Speed Train"
    },
    array: [
        {
            description: "Diesel",
            code: "D"
        },
        {
            description: "Diesel Electric Multiple Unit",
            code: "DEM"
        },
        {
            description: "Diesel Mechanical Multiple Unit",
            code: "DMU"
        },
        {
            description: "Electric",
            code: "E"
        },
        {
            description: "Electro-Diesel",
            code: "ED"
        },
        {
            description: "EMU + D,E,ED locomotive",
            code: "EML"
        },
        {
            description: "Electric Multiple Unit",
            code: "EMU"
        },
        {
            description: "High Speed Train",
            code: "HST"
        }
    ],
    fromCode(code){
        return this.array.find(a => a.code === code)
    }
}

function isEmpty(obj) {
    for (const prop in obj) {
      if (Object.hasOwn(obj, prop)) {
        return false;
      }
    }
  
    return true;
}

var timing_load = {
    fromCode(code, power_type){
        var tl = {}
        switch(code){
            case "69":
                tl = {
                    type: "DMU - Air Brake",
                    unit: ["172/0", "172/1", "172/2"]
                }
                break;
            case "A":
                tl = {
                    type: "DMU - Air Brake",
                    unit: ["172/0", "172/1", "172/2"]
                }
                break;
            case "E": {
                tl = {
                    type: "DMU - Air Brake",
                    unit: ["158", "168", "170", "175"]
                }
                break;
            }
            case "N":
                tl = {
                    type: "DMU - Air Brake",
                    unit: ["165/0"]
                }
                break;
            case "S":
                tl = {
                    type: "DMU - Air Brake",
                    unit: ["150", "153", "155", "156"]
                }
                break;
            case "T":
                tl = {
                    type: "DMU - Air Brake",
                    unit: ["165/1", "166"]
                }
                break;
            case "V":
                tl = {
                    type: "DMU - Air Brake",
                    unit: ["220", "221"]
                }
                break;
            case "T":
                tl = {
                    type: "DMU - Air Brake",
                    unit: ["159"]
                }
                break;
            case "X":
                tl = {
                    type: "DMU - Air Brake",
                    unit: ["165/0"]
                }
                break;
            case "D1":
                tl = {
                    type: "DMU - Vacuum Brake",
                    unit: ["Power Car + Trailer"]
                }
                break;
            case "D2":
                tl = {
                    type: "DMU - Vacuum Brake",
                    unit: ["2 Power Cars + Trailer"]
                }
            case "D3": {
                tl = {
                    type: "DMU - Vacuum Brake",
                    unit: ["Power Twin"]
                }
            }
        }
        if(isEmpty(tl)){
            if(power_type === "EMU"){
                tl.type = "EMU"
                if(code === "AT") tl.unit = ["Accelerated Timings"]
                else if(code === "E") tl.unit = ["458"]
                else if(code === "0") tl.unit = ["380"]
                else if(code === "506") tl.unit = ["350/1"]
                else tl.unit = [code]
            } else {
                if(code === "325"){
                    tl = {
                        type: "EMU",
                        unit: ["325"]
                    }
                } else {
                    tl = {
                        type: "Hauled train E,D or ED",
                        unit: [code]
                    }
                }
            }
        } else {
            tl = {
                type: power_type,
                unit: ["unknown"]
            }
        }
        if(tl.unit[0] === "") tl.unit = ["unknown"]
        return tl
    }
}

var operating_characteristics = {
    object: {
        B: "Vacuum Braked",
        C: "Timed at 100 m.p.h.",
        D: "DOO (Coaching stock trains)",
        E: "Conveys Mark 4 Coaches",
        G: "Trainman (Guard) required",
        M: "Timed at 110 m.p.h.",
        P: "Push/Pull train",
        Q: "Runs as required",
        R: "Air conditioned with PA system",
        S: "Steam Heated",
        Y: "Runs to Terminals/Yards as required",
        Z: "May convey traffic to SB1C gauge. Not to be diverted from booked route without authority."
    },
    array: [
        {
            code: "B",
            description: "Vacuum Braked"
        },
        {
            code: "C",
            description: "Timed at 100 m.p.h."
        },
        {
            code: "D",
            description: "DOO (Coaching stock trains)"
        },
        {
            code: "E",
            description: "Conveys Mark 4 Coaches"
        },
        {
            code: "G",
            description: "Trainman (Guard) required"
        },
        {
            code: "M",
            description: "Timed at 110 m.p.h."
        },
        {
            code: "P",
            description: "Push/Pull train"
        },
        {
            code: "Q",
            description: "Runs as required"
        },
        {
            code: "R",
            description: "Air conditioned with PA system"
        },
        {
            code: "S",
            description: "Steam Heated"
        },
        {
            code: "Y",
            description: "Runs to Terminals/Yards as required"
        },
        {
            code: "Z",
            description: "May convey traffic to SB1C gauge. Not to be diverted from booked route without authority."
        }
    ],
    fromCode(code){
        return this.array.find(a => a.code === code)
    }
}

var train_status = {
    object: {
        B: "Bus (Permanent)",
        F: "Freight (Permanent - WTT)",
        P: "Passenger & Parcels (Permanent - WTT)",
        S: "Ship (Permanent)",
        T: "Trip (Permanent)",
        "1": "STP Passenger & Parcels",
        "2": "STP Freight",
        "3": "STP Trip",
        "4": "STP Ship",
        "5": "STP Bus"
    },
    array: [
        {
            code: "B",
            description: "Bus (Permanent)"
        },
        {
            code: "F",
            description: "Freight (Permanent - WTT)"
        },
        {
            code: "P",
            description: "Passenger & Parcels (Permanent - WTT)"
        },
        {
            code: "S",
            description: "Ship (Permanent)"
        },
        {
            code: "T",
            description: "Thip (Permanent)"
        },
        {
            code: "1",
            description: "STP Passenger & Parcels"
        },
        {
            code: "2",
            description: "STP Freight"
        },
        {
            code: "3",
            description: "STP Trip"
        },
        {
            code: "4",
            description: "STP Ship"
        },
        {
            code: "5",
            description: "Bus"
        }
    ],
    fromCode(code){
        return this.array.find(a => a.code === code)
    }
}

var train_class = {
    object: {
        S: "Standard class only",
        B: "First and standard"
    },
    array: [
        {
            code: "S",
            description: "Standard class only"
        },
        {
            code: "B",
            description: "First and standard"
        },
        {
            code: "",
            description: "First and standard"
        }
    ],
    fromCode(value){
        if(value === "S") return "Standard class only"
        else return "First and standard class"
    },
}

var sleeping_accomodation = {
    object: {
        S: "Standard class only",
        F: "First class only",
        B: "First and standard class"
    },
    array: [
        {
            code: "S",
            description: "Standard class only"
        },
        {
            code: "F",
            description: "First class only"
        },
        {
            code: "B",
            description: "First and standard class"
        }
    ],
    fromCode(code){
        var found = this.array.find(a => a.code === code)
        if(found) return found
        else return "No sleeping accomodation available"
    }
}

var reservations = {
    object: {
        A: "Reservations compulsory",
        E: "Reservations for bicycles essential",
        R: "Reservations recommended",
        S: "Reservations possible from any station"
    },
    array: [
        {
            code: "A",
            description: "Reservations compulsory"
        },
        {
            code: "E",
            description: "Reservations for bicycles essential"
        },
        {
            code: "R",
            description: "Reservations recommended"
        },
        {
            code: "S",
            description: "Reservations possible from any station"
        }
    ],
    fromCode(code){
        var found = this.array.find(a => a.code === code)
        if(found) return found
        else return "Reservations not available"
    }
}

var catering = {
    object: {
        C: "Buffet Service",
        F: "Restaurant Car available for First Class passengers",
        H: "Hot food available",
        M: "Meal included for First Class passengers",
        P: "Wheelchair only reservations",
        R: "Restaurant",
        T: "Trolley service"
    },
    array: [
        {
            code: "C",
            description: "Buffet Service",
        },
        {
            code: "F",
            description: "Restaurant Car available for First Class passengers",
        },
        {
            code: "H",
            description: "Hot food available",
        },
        {
            code: "M",
            description: "Meal included for First Class passengers",
        },
        {
            code: "P",
            description: "Wheelchair only reservations",
        },
        {
            code: "R",
            description: "Restaurant",
        },
        {
            code: "T",
            description: "Trolley Service",
        },
    ],
    fromCode(code){
        var found = this.array.find(a => a.code === code)
        if(found) return found
        else return "No catering"
    },
    parse(string){
        var split = string.replaceAll(' ', '').split('')
        split = split.map(element => {
            return this.array.find(a => a.code === element)
        })
        return split
    }
}

var schedule_type = {
    object: {
        C: "STP cancellation of permanent schedule",
        N: "New STP schedule (not an overlay)",
        O: "STP overlay of permanent schedule",
        P: "Permanent"
    },
    array: [
        {
            code: "C",
            description: "Short term plan cancellation of permanent schedule"
        },
        {
            code: "N",
            description: "New short term plan schedule"
        },
        {
            code: "O", //overlay
            description: "Alteration to permanent schedule"
        },
        {
            code: "P",
            description: "Permanent schedule"
        }
    ],
    fromCode(code){
        return this.array.find(a => a.code === code)
    }
}

class activitycodesObj {
    constructor(){
        this.object = {
            "-D": "Stops to detach vehicles",
            "-T": "Stops to attach and detach vehicles",
            "-U": "Stops to attach vehicles",
            A: "Stops or shunts for other trains to pass",
            AE: "Attach/Detach assisting locomotive",
            AX: "Shows as 'X' on arrival",
            BL: "Stops for banking locomotive",
            C: "Stops to change traincrew",
            D: "Stops to set down passengers (shows 's' in GBTT)",
            E: "Stops for examination",
            G: "GBPRTT Data to add",
            H: "Notional activity to prevent WTT columns merge",
            HH: "As H, to prevent WTT column merge where 3rd Column",
            K: "Passenger count point",
            KC: "Ticket collection and examination point",
            KE: "Ticket examination point",
            KF: "Ticket examination point - first class only",
            KS: "Selective Ticket Examination Point",
            L: "Stops to change locomotive",
            N: "Stop not advertised",
            OP: "Stops for other operating reasons",
            OR: "Train Locomotive on rear",
            PR: "Propelling between points shown",
            R: "Stops when required (shows 'x' in GBTT)",
            RM: "Stops for reversing move or driver changes ends",
            RR: "Stops for locomotive to run round train",
            S: "Stops for Railway Personnel Only",
            T: "Stops to Take Up and Set Down passengers",
            TB: "Train Begins (Origin)",
            TF: "Train Finishes (Destination)",
            TS: "Activity requested for TOPS reporting purposes",
            TW: "Stops or passes for tablet, staff or token",
            U: "Stops to take up passengers (shows 'u' in GBTT)",
            W: "Stops for watering of coaches",
            X: "Passes another train at crossing point on a single line",
        }
        this.array = Object.entries(this.object).map(item => {
            const [ code, description ] = item
            return { code, description }
        })
        this.fromCode = code => {
            return this.array.find(a => a.code === code)
        }
    }
}

module.exports = {
    train_category,
    power_type,
    timing_load,
    operating_characteristics,
    train_status,
    train_class,
    sleeping_accomodation,
    reservations,
    catering,
    schedule_type,
    activity_codes: new activitycodesObj()
}