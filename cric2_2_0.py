import random
from tkinter import *
from tkinter import ttk


p1=input("Enter 1st player name ").title()
p2=input("Enter 2nd player name ").title()

root=Tk()

def bat(w,p,s,t):
    r=random.choice([0,1,2,3,4,6,7,8,9])
    if r==0 or r==7 or r==8:
        w+=1
        balls[p]+=1
        if w>=5:
            if t==p1:
                cric(p2)
            else:
                cric(p1)
    elif r==9:
        s=s+1
    else:
        s=s+r
        balls[p]+=1
        if r==6:
            six[p]+=1
        if r==4:
            fours[p]+=1

if not p1:
    p1="Player1"
if not p2:
    p2="Player2"


Players=["Dhoni ","Kohli ","AB devillers ","Sachin ","Hardik ","Rohit ","Sehwag ","Maxwell "]
fpl2=[]

for i in range(4):
    ind=random.randint(0,len(Players)-1)
    fpl2.append(Players[ind])
    Players.pop(ind)

fpl1=Players[:]
del(Players)
fpl1.insert(0,p1)
fpl2.insert(0,p2)

scoreboard={}
fours={}
six={}
balls={}

for p in fpl1:
    scoreboard[p]=0
    six[p]=0
    fours[p]=0
    balls[p]=0
for p in fpl2:
    balls[p]=0
    six[p]=0
    fours[p]=0
    scoreboard[p]=0

def cric(p,max=1000000):
    print("\n",p," Chance")
    if (p==fpl1[0]):
        fpl=fpl1.copy()
    else:
        fpl=fpl2.copy()
    #now the current team is fpl
    w=0
    s=0
    choosing=Frame(root)
    Label(choosing,text="Choose Batsman").pack()
    for i in range(0,5):
        Button(choosing,text=fpl[i],command=lambda:chosen(i))

    batting=Frame(root)
    Label(batting,text="Total Runs : "+str(s)).pack()
    Label(batting,text="Current Batsman : "+fpl[cur]).pack()
    Label(batting,text="Runs by Current Batsman : "+str(scoreboard[fpl[cur]])).pack()

    Label(batting,text="Run by Last Ball : ").pack()

    Button(batting,text="Click to Bat ",command=lambda:bat(w,fpl[cur],s,p).pack()
    

"""
    print("Choose Opener : ")
    for i in range(0,5):
        print(i,".",fpl[i],end=" ")
    cur=input()
    if cur:
        cur=int(cur)
    if not cur:
        cur=0
    #cur=fpl[cur]
    cs=0

    while True:
        b=input("Enter ")
        r=random.choice([0,1,2,3,4,6,7,8,9,1,1,2,2,4,9])
        if r==0 or r==7 or r==8:
            w+=1
            print("Out")
            balls[fpl[cur]]+=1
            #scoreboard[fpl[cur]]=s-cs
            #cs=s
            if w==5:
                print("Total score of ",p," is ",s)
                return s

            fpl.pop(cur)
            print("Choose Batsman : ")
            for i in range(0,len(fpl)):
                print(i,".",fpl[i],end=" ")

            cur=input()
            if cur:
                cur=int(cur)
            if not cur:
                cur=0
        elif r==9:
            s=s+1
            print("No ball")
        else:
            balls[fpl[cur]]+=1
            if r==4:
                fours[fpl[cur]]+=1
            elif r==6:
                six[fpl[cur]]+=1
            scoreboard[fpl[cur]]+=r
            s+=r
            print("This ball makes ",r)
        print("Score till now ",s,"/",w)
        if w==5:
            print("Total score of ",p," is ",s)
            return s
        if s>max:
            return s

"""

chance=random.randint(0,1)
if chance==1:
    pl1=cric(p1)

    pl2=cric(p2,pl1)
else:
    pl2=cric(p2)
    pl1=cric(p1)

if pl1>pl2:
    print(p1,"Wins ")
    with open("score.py","a") as f:
        f.write(p1 + " Beat " + p2 + " by " + str(pl1-pl2) + " runs \n")
elif pl2>pl1:
    print(p2,"Wins ")
    with open("score.py","a") as f:
        f.write(p2 + " Beat " + p1 + " by " + str(pl2-pl1) + " runs \n")
else:
    print("Draw ")
    with open("score.py","a") as f:
        f.write("Draw between " + p1 + " and " + p2 +"\n")



SCOREBOARD=Toplevel(root)

SCOREBOARD.title("SCOREBOARD")

t1=ttk.Treeview(SCOREBOARD)
t1["columns"]=("R","SF","B")
t1.column("#0",width=150,minwidth=150)
t1.column("R",width=100,minwidth=90)
t1.column("SF",width=150,minwidth=150)
t1.column("B",width=150,minwidth=150)


t1.heading("#0",text="Player name",anchor=W)
t1.heading("R",text="Runs Scored",anchor=W)
t1.heading("SF",text="4/6",anchor=W)
t1.heading("B",text="Balls faced",anchor=W)

s=0

for i in range(1,6):
    s+=scoreboard[fpl1[i-1]]
    t1.insert("",i,text=fpl1[i-1],values=(scoreboard[fpl1[i-1]],str(fours[fpl1[i-1]])+"/"+str(six[fpl1[i-1]]),balls[fpl1[i-1]]))

t1.insert("",6,text="-------------------",values=("-------------","-----------",""))
t1.insert("",7,text="Extras",values=(pl1-s,"",""))
t1.insert("",8,text="Net Total",values=(pl1,"",""))

Label(SCOREBOARD,text="Team 1 ("+p1+"'s Team) Scorecard").pack()
t1.pack()


t2=ttk.Treeview(SCOREBOARD)
t2["columns"]=("R","SF","B")
t2.column("#0",width=150,minwidth=150)
t2.column("R",width=100,minwidth=90)
t2.column("SF",width=150,minwidth=150)
t2.column("B",width=150,minwidth=150)

t2.heading("#0",text="Player name",anchor=W)
t2.heading("R",text="Runs Scored",anchor=W)
t2.heading("SF",text="4/6",anchor=W)
t2.heading("B",text="Balls faced",anchor=W)

s=0

for i in range(1,6):
    s+=scoreboard[fpl2[i-1]]
    t2.insert("",i,text=fpl2[i-1],values=(scoreboard[fpl2[i-1]],str(fours[fpl2[i-1]])+"/"+str(six[fpl2[i-1]]),balls[fpl2[i-1]]))
t2.insert("",6,text="-------------------",values=("-------------","-----------",""))
t2.insert("",7,text="Extras",values=(pl2-s,"",""))
t2.insert("",8,text="Net Total",values=(pl2,"",""))

Label(SCOREBOARD,text="Team 2 ("+p2+"'s Team) Scorecard").pack()
t2.pack()




SCOREBOARD.mainloop()
