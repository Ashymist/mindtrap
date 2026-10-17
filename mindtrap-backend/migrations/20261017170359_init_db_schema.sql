-- +goose Up
CREATE TABLE goals (
  goal_id int PRIMARY KEY,
  description text
);

CREATE table emotion_types (
  type_id int PRIMARY KEY,
  type varchar(255) NOT NULL
);

CREATE TABLE belief_types (
  type_id int PRIMARY KEY,
  type varchar(255) NOT NULL
);

CREATE TABLE events (
    event_id int primary key,
    occured_at timestamp not NULL,
  	activating_event text not NULL,
    response text,
    future_action text,
    goal_id int references goals (goal_id)
);

CREATE TABLE explanations (
  explanation_id int PRIMARY KEY,
  event_id int references events (event_id),
  description text NOT NULL,
  is_realistic boolean NOT NULL
);


CREATE TABLE beliefs (
  belief_id int PRIMARY KEY,
  event_id int references events (event_id),
  belief_type_id int references belief_types (type_id),
  description text,
  believability_before varchar(5),
  believabilty_after varchar(5)
  
);

CREATE TABLE rational_thoughts (
  thought_id int PRIMARY KEY,
  belief_id int references beliefs (belief_id),
  description text NOT NULL,
  believability varchar(5)
);



create table arguments(
  argument_id int PRIMARY KEY,
  belief_id int  references beliefs (belief_id),
  description text NOT NULL,
  is_positive boolean not NULL
);

create table emotions (
  emotion_id int PRIMARY KEY,
  emotion_type_id int references emotion_types (type_id),
  event_id int references events (event_id),
  description text,
  intensivity_before varchar(5) NOT NULL,
  intensivity_after varchar(5)
);



-- +goose Down
DROP TABLE events;
DROP TABLE beliefs;
DROP TABLE belief_types;
DROP TABLE emotions;
DROP TABLE emotion_types;
DROP TABLE arguments;
DROP TABLE explanations;
DROP TABLE rational_thoughts;
DROP TABLE goals;

