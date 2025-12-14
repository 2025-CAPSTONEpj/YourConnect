import json

file = 'crawl_results/results_filter_개발_FE_BE_1년~3년_서울_인천.json'
data = json.load(open(file, encoding='utf-8'))

saramin_count = len([j for j in data if j.get('source') == 'Saramin'])
groupby_count = len([j for j in data if j.get('source') == 'GroupBy'])

print(f'Total: {len(data)}, Saramin: {saramin_count}, GroupBy: {groupby_count}')
print(f'\nSaramin jobs:')
for j in data:
    if j.get('source') == 'Saramin':
        title = j.get('title') or j.get('name') or 'N/A'
        location = j.get('location') or 'N/A'
        print(f'  - {title} | {location}')
        print(f'    Keys: {list(j.keys())}')
