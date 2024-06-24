import random
import cricplayers

p1=input("Enter 1st player name ").title()
p2=input("Enter 2nd player name ").title()

if not p1:
    p1="Player1"
if not p2:
    p2="Player2"

fpl1=cricplayers.fp1()
fpl2=cricplayers.fp2()
fpl1.insert(0,p1)
fpl2.insert(0,p2)

scoreboard={}


def cric(p,max=1000000):
    print("\n",p," Chance")
    if (p==fpl1[0]):
        fpl=fpl1.copy()
    else:
        fpl=fpl2.copy()
    w=0
    s=0
    
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
        r=random.randint(0,9)
        if r==0 or r==7 or r==8:
            w+=1
            print("Out")
            scoreboard[fpl[cur]]=s-cs
            cs=s
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
            scoreboard[fpl[cur]]=s-cs
            s+=r
            print("This ball makes ",r)
        print("Score till now ",s,"/",w)
        if w==5:
            print("Total score of ",p," is ",s)
            return s
        if s>max:
            return s

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

#for i in range(0,5):
#    print(fpl1[i]," : ",scoreboard[fpl1[i]])
print("\n \n \n \n \n ")

from tkinter import *
from tkinter import ttk

root=Tk()

t1=ttk.Treeview(root)
t1["columns"]=("R")
t1.column("#0",width=150,minwidth=150)
t1.column("R",width=100,minwidth=90)

t1.heading("#0",text="Player name",anchor=W)
t1.heading("R",text="Runs Scored",anchor=W)

for i in range(1,6):
    t1.insert("",i,text=fpl1[i-1],values=(scoreboard[fpl1[i-1]]))
t1.insert("",6,text="-------------------",values=("-------------"))
t1.insert("",7,text="Net Total",values=(pl1))

Label(text="Team 1 ("+p1+"'s Team) Scorecard").pack()
t1.pack()


t2=ttk.Treeview(root)
t2["columns"]=("R")
t2.column("#0",width=150,minwidth=150)
t2.column("R",width=100,minwidth=90)

t2.heading("#0",text="Player name",anchor=W)
t2.heading("R",text="Runs Scored",anchor=W)

for i in range(1,6):
    t2.insert("",i,text=fpl2[i-1],values=(scoreboard[fpl2[i-1]]))
t2.insert("",6,text="-------------------",values=("-------------"))
t2.insert("",7,text="Net Total",values=(pl2))

Label(text="Team 2 ("+p2+"'s Team) Scorecard").pack()
t2.pack()




root.mainloop()

    




        
