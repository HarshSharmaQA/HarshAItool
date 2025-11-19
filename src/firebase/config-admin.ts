
// IMPORTANT: These are service account credentials.
// NEVER expose this file or its contents to the client-side.
// This should only be used in server-side environments.

const serviceAccount = {
  "type": "service_account",
  "project_id": "jobwalaqa",
  "private_key_id": "1f2618df8e28bed702073695c12ce1913ec0cbf8",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDHRTQMDRiOV8o5\nfftYBUix5NLzX57sbRyFetXEiGhMHuLXqUQKPgOFBqBGPwtZ/FZ0B4oLqRYn2eak\nsJUMGd1HdG/7JgK92KN254ohkmnSH1zlyBy5G5t0pJBlp9b4VVGFHEyJ1LgJKUSr\n4mxXScoymLWO2SnPp4ZXfGmb2cMQv2JGOfrUnJTyAkm6N1nTVS92kLes6DnLSdXg\nv42cRD7QtepJlyIbwy/8DdY+ahe9BG69xDEwlwg8+siKGm0OGc0+w4lxhvO+gyJ6\nFCLAD/L3184wYV99NEgwmMV3esjuzVAL8neSwJx0YdmIRe9sJWlShhgnlHpjGq2h\nslDVt4vLAgMBAAECggEAAPXBHCgycEEcklhxo0IVexHp+D/Y2G31eEWYDXzwvekj\nEdkDoNfkalZdx2ja5d3p8ycJepofw5bUFx8hi1qoUmkUlFuozEcBEUL3ElXG2J6v\nSCmpPqbTHkk8cmclbOssv4eVF+w5svdgil7GtWUqVNBm9xEnF3fW+Ml6tItyvbwu\nyV0fmXbx2RNauQ9nRmaJ/+t47RCUwm466xwlc/Y9U01uQrIllWnHe9o/imQH2u2O\nZBEfl3JZV2QFYl+Wk/foSNz6GY/jtmUjaFE0+mQbvtpch11yiUrwi2iwZNZ7Fd4l\nqOo7ELWOCM+eQMTusk4BPvnAV1lfcY35OnQfvTOklQKBgQDnW5UsaTG0FSPXV5GC\ntrjD83sNCgO9OjJmqcZx9Z7E+knAGS920ZoajemqKYApyQrQ5jBA+lNrAnwz2dUE\nI+FS71QBLtmJIRi3WHproKynu2U5C4MTBMvJJjgtic+CcNg5zmqAdJa5MjUSuV5C\nhgeN/xZ4+34xRLtwe2ychpQO7wKBgQDcfrHmUCDiMpvZ4bZH4yWq+JbCkiyonObz\nme7gXzn8qfqkKa2UfhNGSgGHJLZgfr7XrBim/9nWG7Q7zpwec7b9Ia5yhC8QM2gl\nY9yBWPo5eVqfou2avzIqs22XdMaALzUe7defr5ymMad6DMiqf9UnyTCo9Ls7+pUF\nNzHFyxzQ5QKBgDKvt9DRAxinAQEuqCxxB622bCEBLqyIUX54d4eD/lK9WucBHYr0\nhMSIjsa+7Ns6tmnp5Gx360qocrmRYb/UdIsM7+SKdRI79ARHGBr4Sps8zQJgaUkD\nZfodq3Uemh3Dxzty45Zc9KCCRWpivino30LWvf+naZA1tLMB91ubiFh1AoGAROFL\nP9B+RUtcBneNUu2xobRgnE2/p7jEKQtIZU06NyT+iHQApqev68BIs+gTFRfjFErN\ntLWuXkVvS1Oiz5yEaJUyAtIqRZxZh3ynsLyUBopTdhUWtsXNrSs6LBstu3OD27Kf\nLmJUxFI0qFsAAMtIUlJ2YgF50CXakbOJV+m4icUCgYAOGwBys1/hNJBa7Bzuw9Gp\nSJuakgcWCn/lEGH3dGbsYA66OtybpPWM8SZI/BS6LXvfVw1oN2ezDR99L+XzSubT\nE2pyU/99PkeA/X99dhI198HYWA7G5GlIuliLTLWirXwjUPeZOhdff/mTSShFtGYC\nCLxBAgO87GYDXiMCm6Yq0w==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@jobwalaqa.iam.gserviceaccount.com",
  "client_id": "105717950833842524711",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40jobwalaqa.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};


export const firebaseAdminConfig = {
  credential: {
    projectId: serviceAccount.project_id,
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'),
  },
  databaseURL: `https://jobwalaqa-default-rtdb.firebaseio.com`
};

export function isFirebaseAdminConfigValid() {
    const cred = firebaseAdminConfig.credential;
    return !!(cred.projectId && cred.clientEmail && cred.privateKey);
}
