import os 
import shutil

def get_manuscript_directory():
    manuscript_directory='./manuscript'
    return manuscript_directory

def get_prototype_directory():
    prototype_directory='./prototype'
    return prototype_directory

def ensure_manuscript_folder():
    manuscript_directory = get_manuscript_directory()
    try:
        shutil.rmtree(manuscript_directory)
    except OSError:
        pass
    os.makedirs(manuscript_directory)
    
    shutil.copytree('./images', os.path.join(manuscript_directory, 'images/'))

def replace_topics(path):
    with open(path, 'r+') as topic:
        topic_data = topic.read()
        topic.seek(0)
        for line in topic:
            if line.startswith('[t: '):
                start_index = line.find('[t: ') + len('[t: ')
                end_index = line.find(']')
                topic = line[start_index:end_index]

                section_path = os.path.join('./topics', topic + '.md')
                if os.path.isfile(section_path):
                    with open(section_path, 'r+') as section_file:
                        data = section_file.read()
                        topic_data = topic_data.replace(line, data)

        with open(path, 'w+') as manscript_file:
            manscript_file.write(topic_data)

def main():
    ensure_manuscript_folder()
    manuscript_directory = get_manuscript_directory()
    prototype_directory = get_prototype_directory()

    for i in os.listdir(prototype_directory):
        topic_path = os.path.join(prototype_directory, i)
        manuscript_path = os.path.join(manuscript_directory, i)
        shutil.copy2(topic_path, manuscript_path)
        replace_topics(manuscript_path)
        replace_topics(manuscript_path)




if __name__ == '__main__':
    main()
