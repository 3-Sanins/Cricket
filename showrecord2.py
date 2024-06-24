from tkinter import *
from tkinter import messagebox
from tkinter import ttk
from pathlib import Path


#root=Tk()
def show(root,scoreboard,balls,six,fours,fpl1,pl1,fpl2=-1,pl2=-1):
    scorecard=Toplevel(root)
    scorecard.title("Score Board")
    if fpl2!=-1:
        if pl1>pl2:
            winner=fpl1
        else:
            winner=fpl2
        man_match=winner[0]
        for player in winner:
            if scoreboard[player]>scoreboard[man_match]:
                man_match=player
                
        best_player=fpl1[0]
        for batter in scoreboard:
            if scoreboard[batter]>scoreboard[best_player]:
                best_player=batter
        
        Label(scorecard,text="Best Player of the Match : "+best_player,fg="red").pack(anchor="center",side="top")
        Label(scorecard,text="Man of the Match : "+man_match,fg="blue").pack(anchor="center",side="top")

    
    t1=ttk.Treeview(scorecard,height=8)
    t1["columns"]=("R","SF","B","SR")
    t1.column("#0",width=150,minwidth=150)
    t1.column("R",width=100,minwidth=90)
    t1.column("SF",width=150,minwidth=150)
    t1.column("B",width=150,minwidth=150)
    t1.column("SR",width=150,minwidth=150)


    t1.heading("#0",text="Player name",anchor=W)
    t1.heading("R",text="Runs Scored",anchor=W)
    t1.heading("SF",text="4/6",anchor=W)
    t1.heading("B",text="Balls faced",anchor=W)
    t1.heading("SR",text="Strike Rate",anchor=W)

    s=0
    k=1
    for i in range(1,len(fpl1)+1):
        
        cursc=scoreboard[fpl1[i-1]]
        if cursc==-1:
            cursc=0
        s+=cursc
        if scoreboard[fpl1[i-1]]!=-1:
            t1.insert("",k,text=fpl1[i-1],values=(cursc,str(fours[fpl1[i-1]])+"/"+str(six[fpl1[i-1]]),balls[fpl1[i-1]],(cursc/balls[fpl1[i-1]])*100))
            k+=1
    t1.insert("",k+1,text="-------------------",values=("-------------"))
    t1.insert("",k+2,text="Extras",values=(pl1-s,"",""))
    t1.insert("",k+3,text="Net Total",values=(pl1))

    Label(scorecard,text=fpl1[0]+"'s Team Scorecard").pack()
    t1.pack()

    if fpl2==-1:
        Button(scorecard,text="Proceed",command=scorecard.destroy).pack()
        return
    
    t2=ttk.Treeview(scorecard,height=8)
    t2["columns"]=("R","SF","B","SR")
    t2.column("#0",width=150,minwidth=150)
    t2.column("R",width=100,minwidth=90)
    t2.column("SF",width=150,minwidth=150)
    t2.column("B",width=150,minwidth=150)
    t2.column("SR",width=150,minwidth=150)

    t2.heading("#0",text="Player name",anchor=W)
    t2.heading("R",text="Runs Scored",anchor=W)
    t2.heading("SF",text="4/6",anchor=W)
    t2.heading("B",text="Balls faced",anchor=W)
    t1.heading("SR",text="Strike Rate",anchor=W)

    s=0
    k=1
    for i in range(1,len(fpl2)+1):
        cursc=scoreboard[fpl2[i-1]]
        if cursc==-1:
            cursc=0
        s+=cursc
        if scoreboard[fpl2[i-1]]!=-1:
            t2.insert("",k,text=fpl2[i-1],values=(cursc,str(fours[fpl2[i-1]])+"/"+str(six[fpl2[i-1]]),balls[fpl2[i-1]],(cursc/balls[fpl2[i-1]])*100))
            k+=1
    t2.insert("",k+1,text="-------------------",values=("-------------"))
    t2.insert("",k+2,text="Extras",values=(pl2-s,"",""))
    t2.insert("",k+3,text="Net Total",values=(pl2))

    Label(scorecard,text=fpl2[0]+"'s Team Scorecard").pack()
    t2.pack()

    Button(scorecard,text="Exit",command=root.destroy).pack(side="left")
    storedata(scoreboard,fpl1,fpl2,pl1,pl2)
    Button(scorecard,text="Records",command=lambda:show_records(root,fpl1,fpl2)).pack(side="right")
    


def show_records(root,t1=-1,t2=-1):
    record=Toplevel(root)
    history=ttk.Treeview(record,height=20)
    history["columns"]=("N","R","M","X")
    history.column("#0",width=150,minwidth=150)
    history.column("N",width=100,minwidth=90)
    history.column("R",width=150,minwidth=150)
    history.column("M",width=150,minwidth=150)
    history.column("X",width=150,minwidth=150)

    history.heading("#0",text="SR. no",anchor=W)
    history.heading("N",text="Name",anchor=W)
    history.heading("R",text="Runs Scored",anchor=W)
    history.heading("M",text="Matches Played",anchor=W)
    history.heading("X",text="Maximum Scores",anchor=W)

    if t2==-1:
        try:
            with open("players.txt","r") as f:
                f.read()
        except:
            with open("players.txt","w") as f:
                f.write("")
        with open("players.txt","r") as f:
            ind=1
            for player in f.readlines():
                with open(player[:len(player)-1]+"runs.txt","r") as rs:
                    try:
                        run=int(rs.read())
                    except:
                        run=5
                with open(player[:len(player)-1]+"_match.txt","r") as ms:
                    try:
                        match=int(ms.read())
                    except:
                        match=0
                try:
                    with open(player[:len(player)-1]+"max.txt","r") as maxi:
                        max_sc=maxi.read()
                except:
                    max_sc=0
                history.insert("",ind-1,text=ind,values=(player,run,match,max_sc))

    else:
        k=0
        for i in range(0,len(t1)):
            player1=t1[i]
            player2=t2[i]
            with open(player1+"runs.txt","r") as rs:
                try:
                    run1=int(rs.read())
                except:
                    run1=0
            with open(player1+"_match.txt","r") as ms:
                try:
                    match1=int(ms.read())
                except:
                    match1=1
            try:
                with open(player1+"max.txt","r") as maxi:
                    max_sc=maxi.read()
            except:
                max_sc=0
                
            history.insert("",k,text=k+1,values=(player1,run1,match1,str(max_sc)))
            k+=1
            try:
                with open(player2+"max.txt","r") as maxi:
                    max_sc=maxi.read()
            except:
                max_sc=0
            
            with open(player2+"runs.txt","r") as rs:
                try:
                    run2=int(rs.read())
                except:
                    run2=0
            with open(player2+"_match.txt","r") as ms:
                try:
                    match2=int(ms.read())
                except:
                    match2=0
            history.insert("",k,text=k+1,values=(player2,run2,match2,str(max_sc)))
            k+=1

    

    Label(record,text="Record of all the Players ").pack()
    history.pack()


def storedata(scoreboard,fpl1,fpl2,pl1,pl2):
    with open("score.txt","a+") as f:
        if pl1>pl2:
            f.write(fpl1[0]+" defeats "+fpl2[0]+" by "+str(pl1-pl2)+" runs \n")
        elif pl2>pl1:
            f.write(fpl2[0]+" defeats "+fpl1[0]+" by "+str(pl2-pl1)+" runs \n")
    for player in scoreboard:
        cursc=scoreboard[player]
        if cursc==-1:
            cursc=0
        present=1
        try:
            with open(player+"runs.txt","r") as f:
                f.read()
        except:
            present=0
        if present==0:
            with open(player+"runs.txt","w") as f:
                f.write(str(cursc))
            with open("players.txt","a+") as f:
                f.write(player+"\n")
            with open(player+"_match.txt","w") as f:
                if scoreboard[player]!=-1:
                    f.write("1")
            with open(player+"max.txt","w") as f:
                f.write(str(cursc))
        else:
            with open(player+"_match.txt","r") as f:
                old=int(f.read())
                new=str(old+1)
            with open(player+"_match.txt","w") as f:
                if scoreboard[player]!=-1:
                    f.write(new)
                else:
                    f.write(str(old))
            with open(player+"runs.txt","r") as f:
                old=int(f.read())
                new=str(old+cursc)
            with open(player+"runs.txt","w") as f:
                f.write(new)
            try:
                with open(player+"max.txt","r") as f:
                    maxi=int(f.read())
                with open(player+"max.txt","w") as f:
                    if cursc>maxi:
                        f.write(str(cursc))
                    else:
                        f.write(str(maxi))
            except:
                with open(player+"max.txt","w") as f:
                    f.write(str(cursc))
                
                

