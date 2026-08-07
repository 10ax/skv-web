import Divider from './Divider';
import config from '../config/index.json';

const About = () => {
  const { story } = config;

  return (
    <section className="bg-background py-8" id="about">
      <h2 className="w-full my-2 font-display text-5xl font-bold leading-tight text-center text-primary">
        {story.title}
      </h2>
      <Divider />
      <div className="mx-auto container max-w-3xl px-4 space-y-4 text-lg text-center text-gray-700 dark:text-gray-300">
        {story.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
};

export default About;
