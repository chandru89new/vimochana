# vimochana

absolutely ( and i mean that in the most absolute sense ) barebones static site generator. i'm doing this - and notice the lowercase "i", i am that unserious about this - to just get a blog up and running for the code stuff i do.

this readme is not for the world. it's for myself.

## to run:

- yarn build

## workflow:

- write some shit in markdown somewhere in your local machine
- add that to d.yaml file with title and date and path
- run `yarn build`

that's it.

## want to change the template?

- template files are in `/templates` folder. currently, the script uses two of them: one for the homepage, one for the blog post page.
- tweak them but make sure to leave {title} and {content} in the file somewhere. that's where the title of the post and content of the post will get rendered.
- styles are in `/templates/styles.css`. i use tailwind here. whatever style you want to apply goes into this file.

## roadmap:

- override default template
- enable caching so builds are faster

