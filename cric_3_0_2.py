import random,time
from tkinter import *
from tkinter import ttk
from tkinter import messagebox

root=Tk()

#global fpl1,fpl2,score1,score2
#score1=0
#score2=0

def khatam(frame):
    pass
    #frame.destroy()



def dsubmit(p1,p2,detail):

    fpl1=["Sehwag","Dhoni","Kholi","Hardik"]
    fpl2=["Sachin","AB Devilliers","Faf","Kapil"]
    
    scoreboard={}
    fours={}
    six={}
    balls={}

    
    p1=str(p1.get()).title()
    p2=str(p2.get()).title()
    messagebox.showinfo("INFO","Players Details filled")
    detail.destroy()
    if not p1:
        p1="Player1"
    if not p2:
        p2="Player2"
    fpl1.insert(0,p1)
    fpl2.insert(0,p2)

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
    
    r=random.choice([p1,p2])

    t1=fpl1[:]
    t2=fpl2[:]
    
    if r==p1:
        messagebox.showinfo("TOSS",str(p1)+"'s chance to bat")
        choose(str(p1),fpl1,0,0,-1,fpl2,scoreboard,balls,six,fours,t1,t2)
    if r==p2:
        messagebox.showinfo("TOSS",str(p2)+"'s chance to bat")
        choose(str(p2),fpl2,0,0,-1,fpl1,scoreboard,balls,six,fours,t1,t2)

def choose(leader,team_list,score,wicket,oppo,fpl,scoreboard,balls,six,fours,t1,t2):
    choosing=Frame(root)
    btns=[]
    Label(choosing,text="Choose Batsman ").pack()
    try:
        Button(choosing,text=team_list[0],command=lambda:bat(leader,team_list,score,wicket,team_list[0],oppo,fpl,choosing,scoreboard,balls,six,fours,t1,t2)).pack()
    except:
        pass
    try:
        Button(choosing,text=team_list[1],command=lambda:bat(leader,team_list,score,wicket,team_list[1],oppo,fpl,choosing,scoreboard,balls,six,fours,t1,t2)).pack()
    except:
        pass
    try:
        Button(choosing,text=team_list[2],command=lambda:bat(leader,team_list,score,wicket,team_list[2],oppo,fpl,choosing,scoreboard,balls,six,fours,t1,t2)).pack()
    except:
        pass
    try:
        Button(choosing,text=team_list[3],command=lambda:bat(leader,team_list,score,wicket,team_list[3],oppo,fpl,choosing,scoreboard,balls,six,fours,t1,t2)).pack()
    except:
        pass
    try:
        Button(choosing,text=team_list[4],command=lambda:bat(leader,team_list,score,wicket,team_list[4],oppo,fpl,choosing,scoreboard,balls,six,fours,t1,t2)).pack()
    except:
        pass

        
    choosing.pack()

def bat(leader,team_list,score,wicket,pl,oppo,fpl,choosing,scoreboard,balls,six,fours,t1,t2):
    index=team_list.index(pl)
    choosing.destroy()
    run(leader,team_list,score,wicket,index,oppo,fpl,scoreboard,balls,six,fours,t1,t2)

def out(leader,team_list,score,wicket,index,take_run,oppo,fpl,scoreboard,balls,six,fours,t1,t2):
    messagebox.showinfo("OUT",team_list[index]+" Out")
    #batting.destroy()
    wicket+=1
    team_list.pop(index)
    if wicket>=5 or len(team_list)==0:
        chanceshuffle(leader,score,oppo,fpl,scoreboard,balls,six,fours,t1,t2)
    else:
        
        choose(leader,team_list,score,wicket,oppo,fpl,scoreboard,balls,six,fours,t1,t2)


def take_run(leader,team_list,score,wicket,index,batting,oppo,fpl,scoreboard,balls,six,fours,t1,t2,last=0):
    batting.destroy()
    pl=team_list[index]

    balls[pl]+=1
    r=random.choice([6,4])
    if r==0 or r==7 or r==8:
        if (last=="No Ball") and (r==7 or r==8):
            run(leader,team_list,score,wicket,index,oppo,fpl,scoreboard,balls,six,fours,t1,t2,0)
        else:
            out(leader,team_list,score,wicket,index,take_run,oppo,fpl,scoreboard,balls,six,fours,t1,t2)
    else:
        if r==9:
            score+=1
            run(leader,team_list,score,wicket,index,oppo,fpl,scoreboard,balls,six,fours,t1,t2,"No Ball")
        else:
            score+=r
            scoreboard[pl]+=r
            if r==6:
                celeb=Frame(root)
                Label(celeb,text="It's a SIX!! ",fg="red").pack()
                celeb.pack()
                #celeb.geometry("250x250+200+200")
                #time.sleep(5)
                #celeb.bind("<Return>",celeb.destroy())
                #celeb.destroy()
                six[pl]+=1
                
            if r==4:
                celeb=Toplevel(root)
                Label(celeb,text="It's a FOUR!! ",fg="blue").pack()
                celeb.geometry("250x250+200+200")
                #time.sleep(2)
                #root.bind("<Any-KeyPress>",celeb.destroy())
                #celeb.destroy()
                fours[pl]+=1
            run(leader,team_list,score,wicket,index,oppo,fpl,scoreboard,balls,six,fours,t1,t2,r)
        
        

def run(leader,team_list,score,wicket,index,oppo,fpl,scoreboard,balls,six,fours,t1,t2,last=0):
    batting=Frame(root)
    total=Label(batting,text="Total Score of "+str(leader)+"'s team : "+str(score)).pack()
    batsman=Label(batting,text="Current Batsman : "+team_list[index]).pack()
    wickets=Label(batting,text="Wickets Remaining : "+str(5-wicket)).pack()
    last_ball=Label(batting,text="Runs From last ball : "+str(last)).pack()

    btn=Button(batting,text="Click me to Bat ",command=lambda:take_run(leader,team_list,score,wicket,index,batting,oppo,fpl,scoreboard,balls,six,fours,t1,t2,last)).pack()

    batting.pack()

def chanceshuffle(leader,score,oppo,fpl,scoreboard,balls,six,fours,t1,t2):
    if (oppo!=-1):
        if str(leader)==str(t1[0]):
            score1=score
            score2=oppo
        else:
            score2=score
            score1=oppo
        
        if score1>score2:
            messagebox.showinfo("Result",str(t1[0])+" Wins")
        elif score1<score2:
            messagebox.showinfo("Result",str(t2[0])+" Wins")
        else:
            messagebox.showinfo("Result","DRAW")
        show(scoreboard,balls,six,fours,t1,score1,t2,score2)
        return

    if str(leader)==str(t1[0]):
        score1=score
        messagebox.showinfo("ALL OUT",str(leader)+"'s inning ends")
        messagebox.showinfo("Target",str(score)+" for "+str(t2[0]))
        show(scoreboard,balls,six,fours,t1,score1)
        choose(str(t2[0]),fpl,0,0,score1,fpl,scoreboard,balls,six,fours,t1,t2)
        
    else:
        score2=score
        messagebox.showinfo("ALL OUT",str(leader)+"'s inning ends")
        messagebox.showinfo("Target",str(score)+" for "+str(t1[0]))
        show(scoreboard,balls,six,fours,t2,score2)
        choose(str(t1[0]),fpl,0,0,score2,fpl,scoreboard,balls,six,fours,t1,t2)
        

def show(scoreboard,balls,six,fours,fpl1,pl1,fpl2=0,pl2=0):
    scorecard=Toplevel(root)
    t1=ttk.Treeview(scorecard)
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

    for i in range(1,len(fpl1)+1):
        s+=scoreboard[fpl1[i-1]]
        t1.insert("",i,text=fpl1[i-1],values=(scoreboard[fpl1[i-1]],str(fours[fpl1[i-1]])+"/"+str(six[fpl1[i-1]]),balls[fpl1[i-1]]))
    t1.insert("",6,text="-------------------",values=("-------------"))
    t1.insert("",7,text="Extras",values=(pl1-s,"",""))
    t1.insert("",7,text="Net Total",values=(pl1))

    Label(scorecard,text=fpl1[0]+"'s Team Scorecard").pack()
    t1.pack()

    if fpl2==0:
        Button(scorecard,text="Proceed",command=scorecard.destroy).pack()
        return
    
    t2=ttk.Treeview(scorecard)
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
    for i in range(1,len(fpl2)+1):
        s+=scoreboard[fpl2[i-1]]
        t2.insert("",i,text=fpl2[i-1],values=(scoreboard[fpl2[i-1]],str(fours[fpl2[i-1]])+"/"+str(six[fpl2[i-1]]),balls[fpl2[i-1]]))
    t2.insert("",6,text="-------------------",values=("-------------"))
    t2.insert("",7,text="Extras",values=(pl2-s,"",""))
    t2.insert("",7,text="Net Total",values=(pl2))

    Label(scorecard,text=fpl2[0]+"'s Team Scorecard").pack()
    t2.pack()

    Button(scorecard,text="Exit",command=root.destroy).pack()



    
def details(welsc):
    welsc.destroy()
    global p1,p2
    detail=Frame(root)
    p1=StringVar()
    p2=StringVar()
    Label(detail,text="Details Form ").grid(row=0,column=0,columnspan=2,ipadx=5)
    Label(detail,text="Player1 Name : ").grid(row=1,column=0)
    Label(detail,text="Player2 Name : ").grid(row=2,column=0)
    e1=Entry(detail,text='Player1',textvariable=p1).grid(row=1,column=1)
    e2=Entry(detail,textvariable=p2).grid(row=2,column=1)
    submit=Button(detail,text="Submit",command=lambda:dsubmit(p1,p2,detail))
    submit.grid(row=3,column=0,columnspan=2,padx=5)
    #submit.bind("<Button-2>",dsubmit(p1,p2,detail))
    detail.pack()

def welcome():
    welsc=Frame(root)
    Label(welsc,text="Welcome to the Game of Cricket ").pack()
    Button(welsc,text="Start ",command=lambda:details(welsc)).pack(anchor="center")
    welsc.pack()

welcome()

root.mainloop()
