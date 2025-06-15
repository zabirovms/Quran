$wrapperUrl = "https://github.com/gradle/gradle/raw/master/gradle/wrapper/gradle-wrapper.jar"
$wrapperPath = "gradle/wrapper/gradle-wrapper.jar"

# Create directory if it doesn't exist
New-Item -ItemType Directory -Force -Path "gradle/wrapper"

# Download the file
Invoke-WebRequest -Uri $wrapperUrl -OutFile $wrapperPath

Write-Host "Gradle wrapper JAR downloaded successfully to $wrapperPath" 