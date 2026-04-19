
import sys

def count_tags(filename):
    with open(filename, 'r') as f:
        content = f.read()
    
    stack = []
    i = 0
    while i < len(content):
        if content[i:i+2] == '<>':
            stack.append('<>')
            i += 2
        elif content[i:i+3] == '</>':
            if not stack or stack[-1] != '<>':
                print(f"Error: unmatched </> at index {i}")
            else:
                stack.pop()
            i += 3
        elif content[i:i+1] == '<' and content[i+1] != ' ' and content[i+1] != '/':
            # Potential tag start
            j = i + 1
            while j < len(content) and content[j] not in (' ', '>', '/'):
                j += 1
            tag_name = content[i+1:j]
            if content[j] == '/': # Self-closing
                i = content.find('>', j) + 1
            else:
                stack.append(tag_name)
                i = content.find('>', j) + 1
        elif content[i:i+2] == '</':
            j = i + 2
            while j < len(content) and content[j] != '>':
                j += 1
            tag_name = content[i+2:j]
            if not stack:
                print(f"Error: unmatched </{tag_name}> at index {i}")
            elif stack[-1] != tag_name:
                 print(f"Error: expected </{stack[-1]}> but found </{tag_name}> at index {i}")
                 stack.pop()
            else:
                stack.pop()
            i = j + 1
        else:
            i += 1
    
    if stack:
        print(f"Unclosed tags: {stack}")

if __name__ == "__main__":
    count_tags(sys.argv[1])
