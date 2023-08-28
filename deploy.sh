echo "Switching to branch master"
git checkout master

echo "Building app..."
npm run build

echo "Deploying files to server.."
scp -r build/* root@161.35.62.90:/var/www/161.35.62.90/

echo "Done!"