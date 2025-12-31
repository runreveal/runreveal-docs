# RunReveal Docs

> [!NOTE]
> This repository has been moved to our internal monorepo. 

The RunReveal Docs site is powered by the nextra documentation template. Feel free to submit pull-requests for typos, new pages of information, or file requests for missing information that you think should be included in the blog.


## Developing

You can start developing with this command.
```
npm run dev
```

## Add Redirects in next.config.mjs like this:
     {
        source: '/reference/native-ai-chat',
        destination: '/ai-chat/native-ai-chat',
        permanent: true,
      },


