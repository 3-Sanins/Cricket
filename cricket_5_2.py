import random
from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.label import Label
from kivy.uix.button import Button
from kivy.uix.textinput import TextInput
from kivy.uix.scrollview import ScrollView
from kivy.uix.gridlayout import GridLayout
from kivy.uix.popup import Popup

class WelcomeScreen(BoxLayout):
    def start_game(self):
        self.clear_widgets()
        self.add_widget(DetailsForm())

class DetailsForm(BoxLayout):
    def submit_details(self, player1, player2):
        self.clear_widgets()
        self.add_widget(PlayersSelection([player1, player2]))

    def show_records(self):
        popup = Popup(title='Records', content=Label(text='Records Screen'), size_hint=(None, None), size=(400, 400))
        popup.open()

class PlayersSelection(BoxLayout):
    def __init__(self, team, **kwargs):
        super().__init__(**kwargs)
        self.team = team

    def choose_batsman(self, player):
        self.clear_widgets()
        self.add_widget(BattingScreen(player, self.team))

class BattingScreen(BoxLayout):
    def __init__(self, leader, team, **kwargs):
        super().__init__(**kwargs)
        self.leader = leader
        self.team = team
        self.score = 0
        self.wicket = 0
        self.current_batsman = ''
        self.oppo = -1
        self.last_run = 0
        self.scoreboard = {player: -1 for player in team}
        self.balls = {player: 0 for player in team}
        self.six = {player: 0 for player in team}
        self.fours = {player: 0 for player in team}
        self.t1 = self.team[:]
        self.t2 = []

    def take_run(self):
        self.add_widget(ScoreBoard(self.leader, self.score, self.oppo, self.current_batsman, self.wicket, self.last_run, self.team, self.scoreboard, self.balls, self.six, self.fours, self.t1, self.t2))

class ScoreBoard(BoxLayout):
    def __init__(self, team_name, score, oppo, current_batsman, wicket, last_run, team, scoreboard, balls, six, fours, t1, t2, **kwargs):
        super().__init__(**kwargs)
        self.team_name = team_name
        self.score = score
        self.oppo = oppo
        self.current_batsman = current_batsman
        self.wicket = wicket
        self.last_run = last_run
        self.team = team
        self.scoreboard = scoreboard
        self.balls = balls
        self.six = six
        self.fours = fours
        self.t1 = t1
        self.t2 = t2
        self.best_player = ''
        self.man_of_the_match = ''
        self.extras = 0
        self.net_total = 0

    def exit_game(self):
        self.clear_widgets()
        self.add_widget(WelcomeScreen())

    def show_records(self):
        self.clear_widgets()
        self.add_widget(RecordsScreen())

class RecordsScreen(BoxLayout):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.players = []
        self.runs = []
        self.matches = []

    def back_to_main_menu(self):
        self.clear_widgets()
        self.add_widget(WelcomeScreen())

class CricketApp(App):
    def build(self):
        return WelcomeScreen()

if __name__ == '__main__':
    CricketApp().run()
