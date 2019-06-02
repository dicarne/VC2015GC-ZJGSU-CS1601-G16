# -*- coding:utf-8 -*-

from pymongo import MongoClient

conn = MongoClient('127.0.0.1', 27017)
db = conn.mc2015
usercol = db.users
thisday = 6
users = {}

class User:
    def __init__(self, id, neibor):
        self.id = id
        self.neibor = neibor

class UserSta:
    def __init__(self, id, x, y, type, wait):
        self.id = id
        self.X = x
        self.Y = y
        self.type = type
        self.wait = wait
class Meet:
    def __init__(self, id, count):
        self.id = id
        self.count = count
class MeetList:
    def __init__(self, day, data):
        self.day = day
        self.data = data

for d in usercol.find():
    users[d["id"]] = User(d["id"], [])

previous = {}
index = 0
for ts in db.movement_timeline.find({"day": thisday}):
    index = index + 1
    movedataraw = db.movement.find({ "Timestamp": ts["Timestamp"] })
    movedata = []
    for v in movedataraw:
        movedata.append(v)
    current = {}
    for v in previous:
        previous[v].wait = previous[v].wait + 1
    for u in movedata:
        current[u["id"]] = u
    for k, v in current.items():
        previous[k] = UserSta(v["id"], v["X"], v["Y"], v["type"], 0)
    mapdata = {}

    for (k ,v) in previous.items():
        if (v.X, v.Y) not in mapdata:
            mapdata[(v.X, v.Y)] = []
        v.neibor = {}
        mapdata[(v.X, v.Y)].append(v)

    for (k ,v) in previous.items():
        for iq in [-1, 0, 1]:
            for j in [-1, 0, 1]:
                if (v.X + iq >= 0 and v.X + iq < 100 and v.Y + j >= 0 and v.Y + j < 100 and 0 != iq and 0 != j):
                    if (v.X + iq, v.Y + j) in mapdata:
                        around = mapdata[(v.X + iq, v.Y + j)]
                        for ne in around:
                            if ne.wait < 180:
                                if ne.id in v.neibor:
                                    v.neibor[ne.id] = v.neibor[ne.id] + 1
                                else:
                                    v.neibor[ne.id] = 1

    if index % 60 == 0:
        print(ts["Timestamp"])
    
for uk, u in previous.items():
    ne = []
    for nid, nc in u.neibor.items():
        ne.append(Meet(nid, nc))
    
    nn = MeetList(thisday, ne)
    db.users.update_one({"id":u.id}, {"$push": {"neibor": nn}})