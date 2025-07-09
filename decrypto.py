import random
import json  # Added for loading keywords from JSON

class DecryptoGame:
    """
    Manages the game state and logic for a single team's device in Decrypto.
    """
    
    # The master keyword list is loaded from an external JSON file at runtime.

    def __init__(self, game_seed: str, team_color: str, keywords_file='keywords.json'):
        """
        Initializes the game on a device.

        Args:
            game_seed (str): The shared seed for the game.
            team_color (str): The color of the team using this device ('white' or 'black').
            keywords_file (str): The path to the JSON file with the keyword bank.
        """
        if team_color.lower() not in ['white', 'black']:
            raise ValueError("Team color must be 'white' or 'black'")

        self.game_seed = game_seed
        self.team_color = team_color.lower()
        self.round_number = 1

        # --- Load Master Keyword List from JSON ---
        try:
            with open(keywords_file, 'r', encoding='utf-8') as f:
                # We only need the 'word' for the game logic, and we convert it to uppercase
                self.MASTER_KEYWORD_LIST = [item['word'].upper() for item in json.load(f)]
        except FileNotFoundError:
            raise FileNotFoundError(f"Error: The keywords file '{keywords_file}' was not found.")
        except json.JSONDecodeError:
            raise ValueError(f"Error: The file '{keywords_file}' is not a valid JSON file.")

        # --- State for my team ---
        self.my_keywords = []
        self.my_miscommunication_tokens = 0
        self.my_interception_tokens = 0

        # --- State for tracking the opponent ---
        self.opponent_clue_history = {1: [], 2: [], 3: [], 4: []}

        # --- Game Setup ---
        self._generate_keywords()

    def _get_seeded_random(self, salt: str):
        """Creates a seeded random generator to ensure determinism."""
        seed = f"{self.game_seed}-{salt}"
        # Use a simple hash for demonstration. A more robust hashing algorithm could be used.
        hashed_seed = hash(seed)
        return random.Random(hashed_seed)

    def _generate_keywords(self):
        """Deterministically generates keywords for both teams from the loaded list."""
        rng = self._get_seeded_random("KEYWORDS")

        if len(self.MASTER_KEYWORD_LIST) < 8:
            raise ValueError("The keyword list must contain at least 8 words.")

        shuffled_list = self.MASTER_KEYWORD_LIST[:]
        rng.shuffle(shuffled_list)

        white_keywords = shuffled_list[0:4]
        black_keywords = shuffled_list[4:8]

        if self.team_color == 'white':
            self.my_keywords = white_keywords
        else:
            self.my_keywords = black_keywords
            
    def get_my_keywords_display(self) -> str:
        """Returns a string of the team's keywords for display."""
        return f"1: {self.my_keywords[0]}, 2: {self.my_keywords[1]}, 3: {self.my_keywords[2]}, 4: {self.my_keywords[3]}"

    def generate_round_code(self, code_for_team: str) -> list[int]:
        """
        Deterministically generates the 3-digit code for a specific team and round.
        
        Args:
            code_for_team (str): The team ('white' or 'black') for which to generate the code.
        
        Returns:
            A list of 3 integers representing the code (e.g., [4, 2, 1]).
        """
        rng = self._get_seeded_random(f"CODE-{code_for_team}-ROUND{self.round_number}")
        # The code is a sequence of 3 numbers from 1 to 4.
        code = rng.sample(range(1, 5), 3)
        return code

    def resolve_white_team_turn(self, white_team_guess: list[int], black_team_interception: list[int], actual_code: list[int]):
        """
        Resolves the turn after the White team's Encryptor gave clues.
        Updates tokens for both teams based on the results.
        
        This method should be called on BOTH devices.
        """
        # 1. Check if the White team deciphered their own code correctly.
        if white_team_guess != actual_code:
            if self.team_color == 'white':
                self.my_miscommunication_tokens += 1
                print(f"WHITE TEAM: Received 1 Miscommunication Token. Total: {self.my_miscommunication_tokens}")
        else:
            print("WHITE TEAM: Successfully deciphered their code.")

        # 2. Check if the Black team intercepted the code (but not in round 1).
        if self.round_number > 1 and black_team_interception == actual_code:
            if self.team_color == 'black':
                self.my_interception_tokens += 1
                print(f"BLACK TEAM: Received 1 Interception Token! Total: {self.my_interception_tokens}")
        elif self.round_number > 1:
            print("BLACK TEAM: Failed to intercept.")

    def resolve_black_team_turn(self, black_team_guess: list[int], white_team_interception: list[int], actual_code: list[int]):
        """
        Resolves the turn after the Black team's Encryptor gave clues.
        Updates tokens for both teams based on the results.
        
        This method should be called on BOTH devices.
        """
        # 1. Check if the Black team deciphered their own code correctly.
        if black_team_guess != actual_code:
            if self.team_color == 'black':
                self.my_miscommunication_tokens += 1
                print(f"BLACK TEAM: Received 1 Miscommunication Token. Total: {self.my_miscommunication_tokens}")
        else:
            print("BLACK TEAM: Successfully deciphered their code.")

        # 2. Check if the White team intercepted the code (but not in round 1).
        if self.round_number > 1 and white_team_interception == actual_code:
            if self.team_color == 'white':
                self.my_interception_tokens += 1
                print(f"WHITE TEAM: Received 1 Interception Token! Total: {self.my_interception_tokens}")
        elif self.round_number > 1:
            print("WHITE TEAM: Failed to intercept.")

    def record_opponent_clues(self, clues: list[str], correct_code: list[int]):
        """
        Records the opponent's clues into the history for future reference.
        This must be called after a turn is resolved.
        """
        if len(clues) != 3 or len(correct_code) != 3:
            print("Error: Must provide 3 clues and a 3-digit code.")
            return
        
        # correct_code is [4, 2, 1], clues are ["Mexico", "Insect", "Horror"]
        # The clue "Mexico" corresponds to keyword 4.
        # The clue "Insect" corresponds to keyword 2.
        # The clue "Horror" corresponds to keyword 1.
        for i in range(3):
            keyword_number = correct_code[i]
            clue = clues[i]
            self.opponent_clue_history[keyword_number].append(clue)
            
    def advance_to_next_round(self):
        """Checks for win/loss conditions and advances the round number."""
        self.round_number += 1
        print(f"\n--- Advancing to Round {self.round_number} ---")

    def check_game_over(self) -> str | None:
        """Checks if a team has won or lost and returns a game over message."""
        if self.my_interception_tokens >= 2:
            return f"GAME OVER: Your team ({self.team_color}) wins by collecting 2 Interception Tokens!"
        if self.my_miscommunication_tokens >= 2:
            return f"GAME OVER: Your team ({self.team_color}) loses by collecting 2 Miscommunication Tokens."
        
        # In the full game, you would also need to check the opponent's tokens.
        # This requires manual confirmation from the players.
        # e.g., "Has the other team won or lost?"
        return None


# --- Example Usage: Simulating a Game ---
# This demonstrates how two separate devices would run the logic.
if __name__ == "__main__":
    GAME_SEED = "NEBULA7"
    
    # === INITIAL SETUP ON BOTH DEVICES ===
    # Device 1 belongs to a player on the White Team
    white_team_device = DecryptoGame(GAME_SEED, 'white')
    # Device 2 belongs to a player on the Black Team
    black_team_device = DecryptoGame(GAME_SEED, 'black')
    
    print("--- Game Setup ---")
    print(f"White Team Device Keywords: {white_team_device.get_my_keywords_display()}")
    print(f"Black Team Device Keywords: {black_team_device.get_my_keywords_display()}")
    assert white_team_device.my_keywords != black_team_device.my_keywords
    print("-" * 20)
    
    # =================================================
    # =============== ROUND 1 =========================
    # =================================================
    print("\n--- ROUND 1 ---")
    
    # --- White Team's Turn ---
    print("\n[White Team's Turn]")
    # 1. White Encryptor generates a code. This will be the same on both devices.
    white_code = white_team_device.generate_round_code(code_for_team='white')
    print(f"White Encryptor secretly gets the code: {white_code}")
    
    # 2. White Encryptor thinks of clues and SAYS THEM ALOUD.
    # Example: Keywords are 1:CASTLE, 2:FOREST, 3:DRAGON, 4:QUEEN
    # Code is [3, 1, 4]. Clues could be "Fire", "Bricks", "Crown".
    white_clues = ["Fire", "Bricks", "Crown"]
    print(f"White Encryptor says clues aloud: {white_clues}")
    
    # 3. Both teams input their guesses into their respective devices.
    # White team discusses and thinks the code is 3, 1, 4.
    white_team_guess_input = [3, 1, 4]
    # Black team discusses. Since it's round 1, they have no info and just guess randomly.
    black_team_guess_input = [2, 1, 3]
    
    # 4. The results are announced, and both devices resolve the turn.
    # Note: In round 1, there are no interceptions.
    print("Resolving turn on White Device...")
    white_team_device.resolve_white_team_turn(white_team_guess_input, black_team_guess_input, white_code)
    print("Resolving turn on Black Device...")
    black_team_device.resolve_white_team_turn(white_team_guess_input, black_team_guess_input, white_code)
    
    # 5. The correct code is revealed, and clues are logged on the OPPONENT'S device.
    black_team_device.record_opponent_clues(white_clues, white_code)
    print("\nBlack team's notes on White team's keywords:")
    print(black_team_device.opponent_clue_history)
    
    # --- Black Team's Turn ---
    # (Process is identical, just reversed)
    # ...
    
    # --- End of Round ---
    white_team_device.advance_to_next_round()
    black_team_device.advance_to_next_round()
    
    # =================================================
    # =============== ROUND 2 =========================
    # =================================================
    print("\n--- ROUND 2 ---")
    
    # --- White Team's Turn ---
    print("\n[White Team's Turn]")
    white_code_r2 = white_team_device.generate_round_code(code_for_team='white')
    print(f"White Encryptor secretly gets the code: {white_code_r2}")
    
    # White Encryptor gives new clues. Code is [1, 2, 3], keywords are 1:CASTLE, 2:FOREST, 3:DRAGON
    white_clues_r2 = ["Moat", "Trees", "Scales"]
    print(f"White Encryptor says clues aloud: {white_clues_r2}")

    # White team makes a mistake. They think "Scales" refers to the Queen (Justice).
    white_team_guess_r2 = [1, 2, 4] 
    
    # Black team now has clues from Round 1.
    # They know "Fire" and "Bricks" pointed to Dragon and Castle.
    # They see "Moat" (likely Castle=1) and "Trees" (likely Forest=2).
    # They correctly guess "Scales" is for Dragon (3). They attempt an interception.
    black_team_guess_r2 = [1, 2, 3]
    
    print("\nResolving turn on White Device...")
    white_team_device.resolve_white_team_turn(white_team_guess_r2, black_team_guess_r2, white_code_r2)
    print("Resolving turn on Black Device...")
    black_team_device.resolve_white_team_turn(white_team_guess_r2, black_team_guess_r2, white_code_r2)
    
    # Check the state of the devices after the turn
    print(f"\nWhite Device State: {white_team_device.my_miscommunication_tokens} MISC, {white_team_device.my_interception_tokens} INT")
    print(f"Black Device State: {black_team_device.my_miscommunication_tokens} MISC, {black_team_device.my_interception_tokens} INT")
    
    # Log the clues for the Black team
    black_team_device.record_opponent_clues(white_clues_r2, white_code_r2)
    print("\nBlack team's updated notes on White team's keywords:")
    print(black_team_device.opponent_clue_history)
