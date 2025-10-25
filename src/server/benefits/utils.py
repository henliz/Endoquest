import os
import re
import ast
import time
from openai import OpenAI
import openai
import tiktoken
import sys
from dotenv import load_dotenv
load_dotenv()

enc = tiktoken.encoding_for_model("gpt-3.5-turbo")


MODEL_NAME = "gpt-4o"
client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
CUMULATIVE_TOKENS = {"input": 0, "output": 0}
TOKEN_LIMIT = 2_000_000  # 1 million tokens



def callGPT(prompt, retries=5, delay=0, JSONflag=False, model=MODEL_NAME, temp=0, token_track=True):
    global CUMULATIVE_TOKENS

    if CUMULATIVE_TOKENS["input"] + CUMULATIVE_TOKENS["output"] > TOKEN_LIMIT:
        print(
            f"Token limit of {TOKEN_LIMIT} exceeded. Current total: {CUMULATIVE_TOKENS['input'] + CUMULATIVE_TOKENS['output']}")
        print("Terminating the program.")
        sys.exit(1)

    attempt = 0

    def log_error(message, exception, attempt):
        print(f"{message} on attempt {attempt + 1}: {exception}")

    while attempt < retries:
        try:
            messages = [
                {"role": "system", "content": str(prompt)},
                {"role": "user",
                 "content": "Produce the requested JSON. Use double quotes for all key/value pairs. Handle special characters as regular text, without escaping them. Do not add code tags."}
            ]

            if attempt > 0:
                print(f"Retry attempt {attempt + 1} of {retries}")

            response = client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temp,
            )

            output = response.choices[0].message.content
            if token_track:
                tokens_in = len(enc.encode(str(prompt)))
                tokens_out = len(enc.encode(str(output)))
                CUMULATIVE_TOKENS["input"] += tokens_in
                CUMULATIVE_TOKENS["output"] += tokens_out
                #print(f"MODEL: {model} | TOKENS IN: {tokens_in} -> TOKENS OUT: {tokens_out}")
                #print(f"CUMULATIVE TOKENS - IN: {CUMULATIVE_TOKENS['input']}, OUT: {CUMULATIVE_TOKENS['output']}")

            # Clean up unnecessary escape characters
            #output = output.replace("\\u2014", "—")

            if JSONflag:
                # Find the first valid JSON object or array in the response
                match = re.search(r'(\{[\s\S]*\}|\[[\s\S]*\])', output)

                if match:
                    json_str = match.group()
                    non_json_before = output[:match.start()].strip()
                    non_json_after = output[match.end():].strip()

                    # Log any non-JSON content found before or after the JSON
                    if len(non_json_before) > 10 or len(non_json_after) > 10:
                        print(f"GPT deviated from JSON:")
                        print("DEBUG THIS:")
                        print(output)
                        print("--------------------")

                        if non_json_before:
                            print(f"Non-JSON before: {non_json_before}")
                        if non_json_after:
                            print(f"Non-JSON after: {non_json_after}")
                        print(f"JSON portion was: {json_str}")
                        print(response.usage)
                        print(f"The prompt was: {prompt}")

                    # Evaluate the JSON content safely
                    output = ast.literal_eval(json_str)
                else:
                    # If no JSON is detected, log the full output
                    print("No JSON detected in output:")
                    print(output)
            return output

        except openai.OpenAIError as e:
            log_error("OpenAI API error", e, attempt)
        except (ValueError, SyntaxError) as e:
            log_error("Parsing error", e, attempt)
            print(output)
        except Exception as e:
            log_error("Unexpected error", e, attempt)
            print("------------------")
            print(prompt)
            print("------------------")
            print(response)
            print("------------------")

        attempt += 1
        if attempt < retries:
            print(f"Waiting for {delay} seconds before retrying...")
            time.sleep(delay)

    print("Maximum retries reached. Exiting.")
    return None

def setup_results_directory(booklet_name):
    # Create a directory for this booklet's results
    results_dir = os.path.join("results", booklet_name)
    os.makedirs(results_dir, exist_ok=True)
    return results_dir

def reset_token_count():
    global CUMULATIVE_TOKENS
    CUMULATIVE_TOKENS = {"input": 0, "output": 0}

# FUTURE IMPROVEMENTS
