"""${message}

Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
Create Date: ${create_date}

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
${imports if imports else ""}

# revision identifiers, used by Alembic.
revision: str = ${repr(up_revision)}
down_revision: Union[str, None] = ${repr(down_revision)}
branch_labels: Union[str, Sequence[str], None] = ${repr(branch_labels)}
depends_on: Union[str, Sequence[str], None] = ${repr(depends_on)}


def upgrade() -> None:
    ${upgrades if upgrades else ""}
    op.add_column('users', sa.Column('home_address', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('home_longitude', sa.String(length=50), nullable=True))
    op.add_column('users', sa.Column('home_latitude', sa.String(length=50), nullable=True))
    op.add_column('users', sa.Column('first_name', sa.String(length=50), nullable=True))
    op.add_column('users', sa.Column('last_name', sa.String(length=50), nullable=True))


def downgrade() -> None:
    ${downgrades if downgrades else ""}
    op.drop_column('users', 'home_address')
    op.drop_column('users', 'home_longitude')
    op.drop_column('users', 'home_latitude')
