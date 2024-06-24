import random,time
from tkinter import *
from tkinter import ttk
from tkinter import messagebox
from showrecord2 import *

root=Tk()
root.title("CRICKET")

def dsubmit(p1,p2,detail):

    fpl1=["Suryakumar","Rohit","Kholi","Maxwell"]
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
        scoreboard[p]=-1
        six[p]=0
        fours[p]=0
        balls[p]=0
    for p in fpl2:
        balls[p]=0
        six[p]=0
        fours[p]=0
        scoreboard[p]=-1
    
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
    root.title("Players")
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
    try:
        Button(choosing,text=team_list[5],command=lambda:bat(leader,team_list,score,wicket,team_list[5],oppo,fpl,choosing,scoreboard,balls,six,fours,t1,t2)).pack()
    except:
        pass
    try:
        Button(choosing,text=team_list[6],command=lambda:bat(leader,team_list,score,wicket,team_list[6],oppo,fpl,choosing,scoreboard,balls,six,fours,t1,t2)).pack()
    except:
        pass
    
        
    choosing.pack()

def bat(leader,team_list,score,wicket,pl,oppo,fpl,choosing,scoreboard,balls,six,fours,t1,t2):
    index=team_list.index(pl)
    scoreboard[pl]=0
    choosing.destroy()
    run(leader,team_list,score,wicket,index,oppo,fpl,scoreboard,balls,six,fours,t1,t2)

def out(leader,team_list,score,wicket,index,take_run,oppo,fpl,scoreboard,balls,six,fours,t1,t2):
    messagebox.showinfo("OUT",team_list[index]+" Out")
    #batting.destroy()
    wicket+=1
    team_list.pop(index)
    if len(team_list)==0:
        chanceshuffle(leader,score,oppo,fpl,scoreboard,balls,six,fours,t1,t2)
    else:
        
        choose(leader,team_list,score,wicket,oppo,fpl,scoreboard,balls,six,fours,t1,t2)


def take_run(leader,team_list,score,wicket,index,batting,oppo,fpl,scoreboard,balls,six,fours,t1,t2,last=0):
    batting.destroy()
    root.title("Running")
    pl=team_list[index]

    balls[pl]+=1
    ball=0
    over=0
    if leader in t1:
        for a in t1:
            ball=ball+balls[a]
    else:
        for a in t2:
            ball=ball+balls[a]
    if ball>=36:
        over=1
    r=random.choice([1,1,1,1,1,1,1,2,2,2,2,2,2,3,3,3,3,4,4,4,6,6,6,7,8,9,0,6,9])
    if r==0 or r==7 or r==8:
        if (last=="No Ball") and (r==7 or r==8):
            if over==1:
                chanceshuffle(leader,score,oppo,fpl,scoreboard,balls,six,fours,t1,t2)
            run(leader,team_list,score,wicket,index,oppo,fpl,scoreboard,balls,six,fours,t1,t2,0)
        else:
            out(leader,team_list,score,wicket,index,take_run,oppo,fpl,scoreboard,balls,six,fours,t1,t2)
    else:
        if r==9:
            score+=1
            if oppo!=-1 and score>oppo:
                chanceshuffle(leader,score,oppo,fpl,scoreboard,balls,six,fours,t1,t2)

            run(leader,team_list,score,wicket,index,oppo,fpl,scoreboard,balls,six,fours,t1,t2,"No Ball")
        else:
            score+=r
            scoreboard[pl]+=r
            if r==6:
                six[pl]+=1
                
            if r==4:
                
                fours[pl]+=1
            if oppo!=-1 and score>oppo:
                chanceshuffle(leader,score,oppo,fpl,scoreboard,balls,six,fours,t1,t2)
            if over==1:
                chanceshuffle(leader,score,oppo,fpl,scoreboard,balls,six,fours,t1,t2)
            run(leader,team_list,score,wicket,index,oppo,fpl,scoreboard,balls,six,fours,t1,t2,r)
        
        

def run(leader,team_list,score,wicket,index,oppo,fpl,scoreboard,balls,six,fours,t1,t2,last=0):
    batting=Frame(root)
    root.title("Batting")
    batting.pack()
    
    total=Label(batting,text="Total Score of "+str(leader)+"'s team : "+str(score)).pack()
    if oppo!=-1:
        Label(batting,text="Chasing : "+str(oppo)).pack()
    batsman=Label(batting,text="Current Batsman : "+team_list[index]).pack()
    wickets=Label(batting,text="Wickets Remaining : "+str(5-wicket)).pack()
    last_ball=Label(batting,text="Runs From last ball : "+str(last)).pack()

    btn=Button(batting,text="Click me to Bat ",command=lambda:take_run(leader,team_list,score,wicket,index,batting,oppo,fpl,scoreboard,balls,six,fours,t1,t2,last)).pack()

    

def chanceshuffle(leader,score,oppo,fpl,scoreboard,balls,six,fours,t1,t2):
    #show(root,scoreboard,balls,six,fours,t1,score1,t2,score2)
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
        show(root,scoreboard,balls,six,fours,t1,score1,t2,score2)
#        welcome()
        return

    if str(leader)==str(t1[0]):
        score1=score
        messagebox.showinfo("ALL OUT",str(leader)+"'s inning ends")
        messagebox.showinfo("Target",str(score)+" for "+str(t2[0]))
        show(root,scoreboard,balls,six,fours,t1,score1)
        choose(str(t2[0]),fpl,0,0,score1,fpl,scoreboard,balls,six,fours,t1,t2)
        
    else:
        score2=score
        messagebox.showinfo("ALL OUT",str(leader)+"'s inning ends")
        messagebox.showinfo("Target",str(score)+" for "+str(t1[0]))
        show(root,scoreboard,balls,six,fours,t2,score2)
        choose(str(t1[0]),fpl,0,0,score2,fpl,scoreboard,balls,six,fours,t1,t2)
        


    
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
    Button(detail,text="Submit",command=lambda:dsubmit(p1,p2,detail)).grid(row=3,column=0,columnspan=1,padx=0)
    Button(detail,text="Records",command=lambda:show_records(root)).grid(row=3,column=1,padx=10)
    detail.pack()

def welcome():
    welsc=Frame(root)
    Label(welsc,text="Welcome to the Game of Cricket ").pack()
    Button(welsc,text="Start ",command=lambda:details(welsc)).pack(anchor="center")
    welsc.pack()


welcome()




root.mainloop()
